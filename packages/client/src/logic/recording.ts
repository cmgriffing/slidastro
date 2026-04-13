let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []

export async function startRecording() {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })

    let cameraStream: MediaStream | null = null
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
    } catch (e) {
      console.warn('Camera not available for recording')
    }

    // Composite streams using a canvas if camera is available
    const stream = cameraStream 
      ? await compositeStreams(screenStream, cameraStream)
      : screenStream

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `presentation-${new Date().toISOString()}.webm`
      a.click()
      recordedChunks = []
    }

    mediaRecorder.start()
    document.body.classList.add('recording-active')
  } catch (err) {
    console.error('Error starting recording:', err)
  }
}

export function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    document.body.classList.remove('recording-active')
  }
}

async function compositeStreams(screenStream: MediaStream, cameraStream: MediaStream): Promise<MediaStream> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  const screenVideo = document.createElement('video')
  screenVideo.srcObject = screenStream
  screenVideo.play()

  const cameraVideo = document.createElement('video')
  cameraVideo.srcObject = cameraStream
  cameraVideo.play()

  // Wait for metadata to get dimensions
  await Promise.all([
    new Promise(r => screenVideo.onloadedmetadata = r),
    new Promise(r => cameraVideo.onloadedmetadata = r),
  ])

  canvas.width = screenVideo.videoWidth
  canvas.height = screenVideo.videoHeight

  function draw() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return
    
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height)
    
    // Draw camera overlay in bottom-right corner
    const camWidth = canvas.width / 4
    const camHeight = (cameraVideo.videoHeight / cameraVideo.videoWidth) * camWidth
    ctx.drawImage(cameraVideo, canvas.width - camWidth - 20, canvas.height - camHeight - 20, camWidth, camHeight)
    
    requestAnimationFrame(draw)
  }

  requestAnimationFrame(draw)

  const compositeStream = canvas.captureStream(30)
  
  // Combine audio tracks
  const audioCtx = new AudioContext()
  const dest = audioCtx.createMediaStreamDestination()
  
  if (screenStream.getAudioTracks().length > 0) {
    audioCtx.createMediaStreamSource(screenStream).connect(dest)
  }
  if (cameraStream.getAudioTracks().length > 0) {
    audioCtx.createMediaStreamSource(cameraStream).connect(dest)
  }

  if (dest.stream.getAudioTracks().length > 0) {
    compositeStream.addTrack(dest.stream.getAudioTracks()[0])
  }

  return compositeStream
}
