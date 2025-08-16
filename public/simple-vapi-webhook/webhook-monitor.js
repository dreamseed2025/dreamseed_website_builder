// Real-time Webhook Monitoring System
// Tracks all VAPI webhook events and call progress

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class WebhookMonitor extends EventEmitter {
    constructor() {
        super();
        this.activeCallTracker = new Map();
        this.callLogs = [];
        this.stageMetrics = {
            1: { calls: 0, completions: 0, avgDuration: 0, avgCompletion: 0 },
            2: { calls: 0, completions: 0, avgDuration: 0, avgCompletion: 0 },
            3: { calls: 0, completions: 0, avgDuration: 0, avgCompletion: 0 },
            4: { calls: 0, completions: 0, avgDuration: 0, avgCompletion: 0 }
        };
        this.realtimeClients = new Set();
    }
    
    // Track call start
    onCallStarted(callData) {
        const callId = callData.callId || this.generateCallId();
        const timestamp = new Date().toISOString();
        
        const callSession = {
            callId: callId,
            customerEmail: callData.customerEmail,
            customerName: callData.customerName,
            businessName: callData.businessName,
            callStage: callData.callStage,
            startTime: timestamp,
            status: 'in_progress',
            transcriptEvents: [],
            extractedData: {},
            completionScore: 0,
            duration: 0
        };
        
        this.activeCallTracker.set(callId, callSession);
        
        const logEntry = {
            timestamp: timestamp,
            type: 'call_started',
            callId: callId,
            stage: callData.callStage,
            customer: callData.customerEmail,
            message: `📞 Call ${callData.callStage} started for ${callData.customerName || callData.customerEmail}`
        };
        
        this.addLogEntry(logEntry);
        this.updateStageMetrics(callData.callStage, 'call_started');
        this.broadcastToClients('call_started', callSession);
        
        console.log(`🎤 [Monitor] Call ${callData.callStage} started: ${callId}`);
        
        return callSession;
    }
    
    // Track transcript events
    onTranscriptReceived(webhookData) {
        const callId = webhookData.callId;
        const callSession = this.activeCallTracker.get(callId);
        
        if (!callSession) {
            console.log(`⚠️ [Monitor] Received transcript for unknown call: ${callId}`);
            return;
        }
        
        const transcriptEvent = {
            timestamp: new Date().toISOString(),
            text: webhookData.transcript,
            type: webhookData.type || 'transcript',
            speaker: webhookData.speaker || 'unknown'
        };
        
        callSession.transcriptEvents.push(transcriptEvent);
        callSession.lastActivity = transcriptEvent.timestamp;
        
        const logEntry = {
            timestamp: transcriptEvent.timestamp,
            type: 'transcript_received',
            callId: callId,
            stage: callSession.callStage,
            customer: callSession.customerEmail,
            message: `💬 Transcript: "${webhookData.transcript.substring(0, 50)}..."`
        };
        
        this.addLogEntry(logEntry);
        this.broadcastToClients('transcript_received', { callId, transcriptEvent });
        
        console.log(`💬 [Monitor] Transcript received for ${callId}: ${webhookData.transcript.length} chars`);
    }
    
    // Track AI extraction results
    onExtractionCompleted(callId, extractionResult) {
        const callSession = this.activeCallTracker.get(callId);
        
        if (!callSession) {
            console.log(`⚠️ [Monitor] Extraction result for unknown call: ${callId}`);
            return;
        }
        
        callSession.extractedData = extractionResult;
        callSession.completionScore = extractionResult.validation?.completionScore || 0;
        callSession.lastExtraction = new Date().toISOString();
        
        const logEntry = {
            timestamp: callSession.lastExtraction,
            type: 'extraction_completed',
            callId: callId,
            stage: callSession.callStage,
            customer: callSession.customerEmail,
            message: `🤖 AI extraction completed - ${callSession.completionScore}% complete`
        };
        
        this.addLogEntry(logEntry);
        this.broadcastToClients('extraction_completed', { callId, extractionResult });
        
        console.log(`🤖 [Monitor] Extraction completed for ${callId}: ${callSession.completionScore}%`);
    }
    
    // Track call completion
    onCallCompleted(callId, endData = {}) {
        const callSession = this.activeCallTracker.get(callId);
        
        if (!callSession) {
            console.log(`⚠️ [Monitor] Call completion for unknown call: ${callId}`);
            return;
        }
        
        const endTime = new Date().toISOString();
        const startTime = new Date(callSession.startTime);
        const duration = Math.round((new Date(endTime) - startTime) / 1000); // seconds
        
        callSession.endTime = endTime;
        callSession.duration = duration;
        callSession.status = 'completed';
        callSession.endReason = endData.reason || 'unknown';
        
        // Archive the call
        this.callLogs.push({ ...callSession });
        this.activeCallTracker.delete(callId);
        
        const logEntry = {
            timestamp: endTime,
            type: 'call_completed',
            callId: callId,
            stage: callSession.callStage,
            customer: callSession.customerEmail,
            message: `✅ Call ${callSession.callStage} completed (${this.formatDuration(duration)}) - ${callSession.completionScore}% data collected`
        };
        
        this.addLogEntry(logEntry);
        this.updateStageMetrics(callSession.callStage, 'call_completed', { duration, completionScore: callSession.completionScore });
        this.broadcastToClients('call_completed', callSession);
        
        console.log(`✅ [Monitor] Call ${callId} completed: ${duration}s, ${callSession.completionScore}% complete`);
        
        return callSession;
    }
    
    // Track call failures
    onCallFailed(callId, error) {
        const callSession = this.activeCallTracker.get(callId);
        
        if (callSession) {
            callSession.status = 'failed';
            callSession.error = error.message || error;
            callSession.endTime = new Date().toISOString();
            
            this.callLogs.push({ ...callSession });
            this.activeCallTracker.delete(callId);
        }
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'call_failed',
            callId: callId,
            stage: callSession?.callStage || 'unknown',
            customer: callSession?.customerEmail || 'unknown',
            message: `❌ Call failed: ${error.message || error}`
        };
        
        this.addLogEntry(logEntry);
        this.broadcastToClients('call_failed', { callId, error });
        
        console.log(`❌ [Monitor] Call ${callId} failed: ${error.message || error}`);
    }
    
    // Get current status
    getStatus() {
        return {
            activeCalls: Array.from(this.activeCallTracker.values()),
            recentLogs: this.callLogs.slice(-10),
            stageMetrics: this.stageMetrics,
            systemStats: {
                totalCalls: this.callLogs.length,
                activeCalls: this.activeCallTracker.size,
                connectedClients: this.realtimeClients.size
            }
        };
    }
    
    // Get call details
    getCallDetails(callId) {
        return this.activeCallTracker.get(callId) || 
               this.callLogs.find(call => call.callId === callId);
    }
    
    // Get customer call history
    getCustomerHistory(customerEmail) {
        const activeCalls = Array.from(this.activeCallTracker.values())
            .filter(call => call.customerEmail === customerEmail);
        
        const completedCalls = this.callLogs
            .filter(call => call.customerEmail === customerEmail);
        
        return {
            activeCalls,
            completedCalls,
            totalCalls: activeCalls.length + completedCalls.length
        };
    }
    
    // Real-time client management
    addRealtimeClient(clientId, sendFunction) {
        this.realtimeClients.add({ clientId, send: sendFunction });
        console.log(`🔌 [Monitor] Client connected: ${clientId}`);
    }
    
    removeRealtimeClient(clientId) {
        this.realtimeClients = new Set(
            Array.from(this.realtimeClients).filter(client => client.clientId !== clientId)
        );
        console.log(`🔌 [Monitor] Client disconnected: ${clientId}`);
    }
    
    broadcastToClients(eventType, data) {
        const message = {
            type: eventType,
            timestamp: new Date().toISOString(),
            data: data
        };
        
        this.realtimeClients.forEach(client => {
            try {
                client.send(JSON.stringify(message));
            } catch (error) {
                console.log(`⚠️ [Monitor] Failed to send to client ${client.clientId}:`, error.message);
            }
        });
    }
    
    // Analytics and reporting
    generateStageReport(stage) {
        const stageData = this.stageMetrics[stage];
        const stageCalls = this.callLogs.filter(call => call.callStage === stage);
        
        return {
            stage: stage,
            totalCalls: stageData.calls,
            completions: stageData.completions,
            averageDuration: stageData.avgDuration,
            averageCompletion: stageData.avgCompletion,
            successRate: stageData.calls > 0 ? (stageData.completions / stageData.calls * 100).toFixed(1) : 0,
            recentCalls: stageCalls.slice(-5)
        };
    }
    
    generateSystemReport() {
        const now = new Date();
        const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
        
        const recent = this.callLogs.filter(call => new Date(call.startTime) > last24Hours);
        
        return {
            timestamp: now.toISOString(),
            totalCalls: this.callLogs.length,
            callsLast24h: recent.length,
            activeCalls: this.activeCallTracker.size,
            averageCallDuration: this.calculateAverageCallDuration(),
            stageBreakdown: {
                stage1: this.generateStageReport(1),
                stage2: this.generateStageReport(2),
                stage3: this.generateStageReport(3),
                stage4: this.generateStageReport(4)
            }
        };
    }
    
    // Utility methods
    addLogEntry(entry) {
        this.callLogs.push(entry);
        
        // Keep only last 1000 log entries
        if (this.callLogs.length > 1000) {
            this.callLogs = this.callLogs.slice(-1000);
        }
        
        this.emit('log_entry', entry);
    }
    
    updateStageMetrics(stage, eventType, data = {}) {
        if (!this.stageMetrics[stage]) return;
        
        const metrics = this.stageMetrics[stage];
        
        if (eventType === 'call_started') {
            metrics.calls++;
        } else if (eventType === 'call_completed') {
            metrics.completions++;
            
            if (data.duration) {
                metrics.avgDuration = (metrics.avgDuration * (metrics.completions - 1) + data.duration) / metrics.completions;
            }
            
            if (data.completionScore !== undefined) {
                metrics.avgCompletion = (metrics.avgCompletion * (metrics.completions - 1) + data.completionScore) / metrics.completions;
            }
        }
    }
    
    generateCallId() {
        return 'call_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    calculateAverageCallDuration() {
        const completedCalls = this.callLogs.filter(call => call.status === 'completed' && call.duration);
        if (completedCalls.length === 0) return 0;
        
        const totalDuration = completedCalls.reduce((sum, call) => sum + call.duration, 0);
        return Math.round(totalDuration / completedCalls.length);
    }
    
    // Save/load persistent data
    saveToFile(filename = 'webhook-monitor-data.json') {
        const data = {
            callLogs: this.callLogs,
            stageMetrics: this.stageMetrics,
            timestamp: new Date().toISOString()
        };
        
        try {
            fs.writeFileSync(filename, JSON.stringify(data, null, 2));
            console.log(`💾 [Monitor] Data saved to ${filename}`);
        } catch (error) {
            console.error(`❌ [Monitor] Failed to save data:`, error.message);
        }
    }
    
    loadFromFile(filename = 'webhook-monitor-data.json') {
        try {
            if (fs.existsSync(filename)) {
                const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
                this.callLogs = data.callLogs || [];
                this.stageMetrics = data.stageMetrics || this.stageMetrics;
                console.log(`📁 [Monitor] Data loaded from ${filename} - ${this.callLogs.length} historical calls`);
            }
        } catch (error) {
            console.error(`❌ [Monitor] Failed to load data:`, error.message);
        }
    }
}

module.exports = WebhookMonitor;