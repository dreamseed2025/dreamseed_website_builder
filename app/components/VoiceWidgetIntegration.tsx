'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import VoiceWidget from './VoiceWidget'
import EnhancedVoiceWidget from './EnhancedVoiceWidget'

interface VoiceWidgetIntegrationProps {
  page?: string
  autoLoad?: boolean
  widgetType?: 'basic' | 'enhanced'
  useWhisper?: boolean
}

export default function VoiceWidgetIntegration({
  page = 'default',
  autoLoad = true,
  widgetType = 'enhanced',
  useWhisper = true
}: VoiceWidgetIntegrationProps) {
  const [userId, setUserId] = useState<string | undefined>()
  const [dreamId, setDreamId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (autoLoad) {
      loadUserContext()
    } else {
      setIsLoading(false)
    }
  }, [autoLoad])

  const loadUserContext = async () => {
    try {
      // Try to get user from Supabase auth
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUserId(session.user.id)
        
        // Try to get dream ID from user's dream DNA
        const { data: dreamDNA } = await supabase
          .from('dream_dna')
          .select('id')
          .eq('user_id', session.user.id)
          .single()
        
        if (dreamDNA?.id) {
          setDreamId(dreamDNA.id)
        }
      } else {
        // Fallback: try to get from session storage or URL params
        const urlParams = new URLSearchParams(window.location.search)
        const urlUserId = urlParams.get('userId')
        const urlDreamId = urlParams.get('dreamId')
        
        if (urlUserId) setUserId(urlUserId)
        if (urlDreamId) setDreamId(urlDreamId)
        
        // Check session storage
        const storedUserId = sessionStorage.getItem('voice_widget_user_id')
        const storedDreamId = sessionStorage.getItem('voice_widget_dream_id')
        
        if (storedUserId && !userId) setUserId(storedUserId)
        if (storedDreamId && !dreamId) setDreamId(storedDreamId)
      }
    } catch (error) {
      console.error('Failed to load user context:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConversationStart = () => {
    // Analytics tracking
    console.log(`Voice conversation started on page: ${page}`)
    
    // You can add analytics tracking here
    // analytics.track('voice_conversation_started', {
    //   page,
    //   userId,
    //   dreamId,
    //   widgetType
    // })
  }

  const handleConversationEnd = () => {
    // Analytics tracking
    console.log(`Voice conversation ended on page: ${page}`)
    
    // You can add analytics tracking here
    // analytics.track('voice_conversation_ended', {
    //   page,
    //   userId,
    //   dreamId,
    //   widgetType
    // })
  }

  const handleError = (error: string) => {
    console.error(`Voice widget error on page ${page}:`, error)
    
    // You can add error tracking here
    // analytics.track('voice_widget_error', {
    //   page,
    //   userId,
    //   dreamId,
    //   error,
    //   widgetType
    // })
  }

  if (isLoading) {
    return null // Don't show widget while loading
  }

  // Don't show widget if no user context and autoLoad is true
  if (autoLoad && !userId && !dreamId) {
    return null
  }

  return (
    <>
      {widgetType === 'enhanced' ? (
        <EnhancedVoiceWidget
          userId={userId}
          dreamId={dreamId}
          useWhisper={useWhisper}
          onConversationStart={handleConversationStart}
          onConversationEnd={handleConversationEnd}
          onError={handleError}
        />
      ) : (
        <VoiceWidget
          userId={userId}
          dreamId={dreamId}
          onConversationStart={handleConversationStart}
          onConversationEnd={handleConversationEnd}
          onError={handleError}
        />
      )}
    </>
  )
}

// Helper function to manually set user context
export const setVoiceWidgetContext = (userId?: string, dreamId?: string) => {
  if (userId) {
    sessionStorage.setItem('voice_widget_user_id', userId)
  }
  if (dreamId) {
    sessionStorage.setItem('voice_widget_dream_id', dreamId)
  }
  
  // Reload the page to apply new context
  window.location.reload()
}

// Helper function to clear user context
export const clearVoiceWidgetContext = () => {
  sessionStorage.removeItem('voice_widget_user_id')
  sessionStorage.removeItem('voice_widget_dream_id')
  
  // Reload the page to apply new context
  window.location.reload()
}
