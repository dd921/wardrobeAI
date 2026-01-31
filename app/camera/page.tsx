'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Camera, RotateCcw, Check, X, SwitchCamera, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CameraPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  const startCamera = useCallback(async () => {
    setIsStarting(true)
    setCameraError(null)

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Camera error:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setCameraError('Camera access was denied. Please allow camera access in your browser settings.')
        } else if (err.name === 'NotFoundError') {
          setCameraError('No camera found on this device.')
        } else {
          setCameraError('Unable to access camera. Please try again.')
        }
      }
    } finally {
      setIsStarting(false)
    }
  }, [facingMode, stream])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    if (stream) {
      // Camera will restart with new facing mode
      stopCamera()
      setTimeout(startCamera, 100)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame
    context.drawImage(video, 0, 0)

    // Get the image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)
    stopCamera()
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const usePhoto = () => {
    if (!capturedImage) return

    // Store the image in sessionStorage to pass to add-item page
    sessionStorage.setItem('capturedPhoto', capturedImage)
    router.push('/add-item?fromCamera=true')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Take Photo</h1>
              <p className="text-gray-400 text-sm">
                Capture a photo of your clothing item
              </p>
            </div>
            <Link href="/" className="text-gray-400 hover:text-white">
              <X className="h-6 w-6" />
            </Link>
          </div>

          {/* Camera View */}
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3]">
              {!stream && !capturedImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {cameraError ? (
                    <div className="text-center px-6">
                      <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-red-400 mb-4">{cameraError}</p>
                      <button onClick={startCamera} className="btn-primary">
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <button
                        onClick={startCamera}
                        disabled={isStarting}
                        className="btn-primary flex items-center gap-2"
                      >
                        {isStarting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Starting Camera...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4" />
                            Start Camera
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${stream && !capturedImage ? 'block' : 'hidden'}`}
              />

              {/* Captured Image Preview */}
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Hidden Canvas for Capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="mt-6 flex justify-center gap-4">
              {stream && !capturedImage && (
                <>
                  <button
                    onClick={switchCamera}
                    className="p-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
                    title="Switch Camera"
                  >
                    <SwitchCamera className="h-6 w-6" />
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="p-6 bg-white text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
                    title="Take Photo"
                  >
                    <Camera className="h-8 w-8" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="p-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
                    title="Cancel"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </>
              )}

              {capturedImage && (
                <>
                  <button
                    onClick={retakePhoto}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Retake
                  </button>
                  <button
                    onClick={usePhoto}
                    className="flex items-center gap-2 px-6 py-3 bg-wardrobe-500 text-white rounded-lg hover:bg-wardrobe-600 transition-colors"
                  >
                    <Check className="h-5 w-5" />
                    Use Photo
                  </button>
                </>
              )}
            </div>

            {/* Tips */}
            <div className="mt-8 bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Tips for best results</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>Use good lighting - natural light works best</li>
                <li>Place the item on a plain, contrasting background</li>
                <li>Lay the item flat or hang it up</li>
                <li>Fill the frame with the item</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
