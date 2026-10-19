# Hero video

The home page plays the Commons booth time-lapse from this folder:

- `commons-timelapse.mp4`: H.264, for Safari and Chrome
- `commons-timelapse.webm`: VP9, for browsers without H.264
- `commons-timelapse-poster.jpg`: the finished wall, shown before the video loads

To swap in a new video, replace all three (same names). From an iPhone `.mov`:

```
ffmpeg -i IMG_1234.mov -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 22 -preset slow -an -movflags +faststart commons-timelapse.mp4
ffmpeg -i commons-timelapse.mp4 -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -an commons-timelapse.webm
ffmpeg -sseof -1.5 -i commons-timelapse.mp4 -frames:v 1 -q:v 3 commons-timelapse-poster.jpg
```

Keep each file under ~15 MB so it loads fast on phones. To host the video elsewhere instead, set `NEXT_PUBLIC_HERO_VIDEO` to its URL in Vercel.
