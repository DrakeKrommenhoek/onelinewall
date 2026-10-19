# Hero video

Drop the time-lapse from the Commons booth here as **`commons-timelapse.mp4`**.
The home page picks it up automatically. Until it exists, the hero shows animated marker lines instead.

Tips so it loads fast on phones:

- Keep it under ~15 MB (GitHub rejects files over 100 MB).
- 1080p or 720p, H.264 MP4, no audio track needed (it plays muted).
- Optional compression with ffmpeg:

  ```
  ffmpeg -i input.mov -vf "scale=-2:1080" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart commons-timelapse.mp4
  ```

Want to host the video somewhere else instead (e.g. Vercel Blob)? Set `NEXT_PUBLIC_HERO_VIDEO` to its URL in Vercel.
