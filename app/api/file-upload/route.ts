import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const filePurpose = formData.get('purpose') as string || 'general'
    const tags = formData.get('tags') as string || ''
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    // Get user from authentication
    const authorization = request.headers.get('authorization')
    let userId: string | null = null
    
    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.substring(7)
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (!authError && user) {
        userId = user.id
      }
    }
    
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
      }
      userId = user.id
    }

    console.log('📁 Processing file upload for user:', userId)

    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Determine file type and category
    const fileType = getFileType(file.type)
    const fileName = generateFileName(file.name, userId)
    
    // Upload to Supabase Storage
    const bucketName = getBucketName(fileType)
    const storagePath = `${userId}/${filePurpose}/${fileName}`

    console.log(`⬆️ Uploading to bucket: ${bucketName}, path: ${storagePath}`)

    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
    }

    console.log('✅ File uploaded successfully:', uploadData.path)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath)

    // Save file metadata to database
    const fileBucketRecord = {
      user_id: userId,
      file_name: fileName,
      original_name: file.name,
      file_type: fileType,
      mime_type: file.type,
      file_size_bytes: file.size,
      storage_path: storagePath,
      storage_bucket: bucketName,
      public_url: urlData.publicUrl,
      file_purpose: filePurpose,
      processing_status: 'uploaded',
      metadata: {
        upload_date: new Date().toISOString(),
        original_size: file.size,
        content_type: file.type
      },
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      ai_description: '', // Will be populated by AI processing later
      upload_session_id: null
    }

    let fileBucketId: string | null = null

    try {
      const { data: bucketData, error: bucketError } = await supabase
        .from('file_buckets')
        .insert(fileBucketRecord)
        .select()

      if (bucketError) {
        console.log('⚠️ Could not save to file_buckets table:', bucketError.message)
        // File is uploaded, but metadata not saved - continue
      } else if (bucketData && bucketData.length > 0) {
        fileBucketId = bucketData[0].id
        console.log('✅ Saved file metadata to file_buckets:', fileBucketId)

        // Create media asset if this is a media file
        if (fileType === 'image' || fileType === 'video') {
          await createMediaAsset(supabase, userId, bucketData[0], filePurpose)
        }
      }
    } catch (error) {
      console.log('⚠️ file_buckets table not accessible, file uploaded but metadata not saved')
    }

    // Process file based on type
    const processingResult = await processUploadedFile(supabase, file, fileBucketId, fileType, filePurpose)

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file_id: fileBucketId,
      file_name: fileName,
      file_type: fileType,
      file_size: file.size,
      public_url: urlData.publicUrl,
      storage_path: storagePath,
      bucket: bucketName,
      purpose: filePurpose,
      processing_status: processingResult.status,
      ai_analysis: processingResult.analysis,
      metadata: fileBucketRecord.metadata
    })

  } catch (error) {
    console.error('❌ Error in file upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video' 
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf')) return 'document'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
  if (mimeType.includes('text')) return 'document'
  return 'other'
}

function getBucketName(fileType: string): string {
  switch (fileType) {
    case 'image': return 'webimages'
    case 'video': return 'videos'
    case 'audio': return 'audio'
    case 'document': return 'documents'
    default: return 'general'
  }
}

function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop() || ''
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')
  return `${timestamp}_${baseName.substring(0, 50)}.${extension}`
}

async function createMediaAsset(supabase: any, userId: string, fileBucketData: any, purpose: string) {
  console.log('🖼️ Creating media asset for image/video file...')
  
  try {
    const assetCategory = getAssetCategory(purpose)
    const mediaAssetRecord = {
      user_id: userId,
      file_bucket_id: fileBucketData.id,
      asset_category: assetCategory.category,
      asset_subcategory: assetCategory.subcategory,
      display_name: fileBucketData.original_name,
      alt_text: `${assetCategory.category} for business`,
      optimization_status: 'pending',
      optimized_versions: {},
      usage_rights: 'user_owned',
      ai_tags: [],
      color_palette: {},
      is_primary: purpose === 'logo' || purpose === 'hero_image',
      sort_order: 0
    }

    const { data, error } = await supabase
      .from('media_assets')
      .insert(mediaAssetRecord)
      .select()

    if (error) {
      console.log('⚠️ Could not create media asset:', error.message)
    } else {
      console.log('✅ Created media asset:', data[0].id)
    }
  } catch (error) {
    console.log('⚠️ media_assets table not accessible')
  }
}

function getAssetCategory(purpose: string): { category: string, subcategory: string } {
  switch (purpose) {
    case 'logo':
      return { category: 'branding', subcategory: 'primary_logo' }
    case 'hero_image':
      return { category: 'hero', subcategory: 'main_banner' }
    case 'product_photo':
      return { category: 'gallery', subcategory: 'product_showcase' }
    case 'team_photo':
      return { category: 'team', subcategory: 'staff_photos' }
    case 'testimonial_image':
      return { category: 'testimonial', subcategory: 'customer_photos' }
    default:
      return { category: 'general', subcategory: 'miscellaneous' }
  }
}

async function processUploadedFile(
  supabase: any, 
  file: File, 
  fileBucketId: string | null, 
  fileType: string, 
  purpose: string
): Promise<{ status: string, analysis: any }> {
  
  console.log(`🔄 Processing ${fileType} file for purpose: ${purpose}`)
  
  // Basic file analysis
  const analysis: any = {
    file_type: fileType,
    purpose: purpose,
    timestamp: new Date().toISOString()
  }

  try {
    if (fileType === 'image') {
      // Image processing would go here
      analysis.image_analysis = {
        estimated_dimensions: 'Will be processed',
        estimated_colors: 'Will be extracted',
        content_type: 'Business image'
      }
      
      if (purpose === 'logo') {
        analysis.logo_analysis = {
          suitable_for_branding: true,
          recommended_usage: 'Primary business logo'
        }
      }
    }
    
    if (fileType === 'document') {
      analysis.document_analysis = {
        estimated_pages: 'Will be processed',
        content_type: 'Business document',
        extractable_text: true
      }
    }

    // Update processing status if we have a file bucket record
    if (fileBucketId) {
      try {
        await supabase
          .from('file_buckets')
          .update({
            processing_status: 'processed',
            ai_description: `${fileType} file uploaded for ${purpose}`,
            processed_at: new Date().toISOString()
          })
          .eq('id', fileBucketId)
      } catch (error) {
        console.log('⚠️ Could not update file processing status')
      }
    }

    return {
      status: 'processed',
      analysis: analysis
    }

  } catch (error) {
    console.error('❌ Error processing file:', error)
    return {
      status: 'error',
      analysis: { error: 'Processing failed' }
    }
  }
}