"""Index a short CFR H.264 MP4 for the homepage's WebCodecs player."""

import argparse
import base64
import json
from fractions import Fraction
from pathlib import Path
import subprocess


def index_video(video: Path, ffprobe: str) -> dict:
    metadata = subprocess.check_output(
        [
            ffprobe, "-v", "error", "-select_streams", "v:0",
            "-show_entries",
            "stream=codec_name,width,height,time_base,r_frame_rate,extradata:packet=pts,dts,pos,size,flags",
            "-show_data", "-of", "json", str(video),
        ],
        text=True,
    )
    probe = json.loads(metadata)
    stream = probe["streams"][0]
    if stream["codec_name"] != "h264" or Fraction(stream["r_frame_rate"]) != 24:
        raise ValueError("Encode the hero as H.264 at a constant 24 frames per second")

    description = bytearray()
    for line in stream["extradata"].splitlines():
        if ":" in line:
            description.extend(bytes.fromhex(line.split(":")[1].strip().split("  ")[0]))
    if description[0] != 1:
        raise ValueError("Expected an AVCDecoderConfigurationRecord")

    samples = []
    group = -1
    time_base = Fraction(stream["time_base"])
    for frame, packet in enumerate(probe["packets"]):
        if packet["dts"] != packet["pts"] or packet["pts"] * time_base != Fraction(frame, 24):
            raise ValueError("Encode in display order with B-frames disabled")
        if "K" in packet["flags"]:
            group += 1
        if group < 0:
            raise ValueError("The first frame must be a keyframe")
        samples.append([int(packet["pos"]), int(packet["size"]), group])

    return {
        "codec": "avc1." + description[1:4].hex(),
        "width": stream["width"],
        "height": stream["height"],
        "description": base64.b64encode(description).decode("ascii"),
        "samples": samples,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("videos", type=Path, nargs="+")
    parser.add_argument("--ffprobe", default="ffprobe")
    args = parser.parse_args()
    for video in args.videos:
        index = index_video(video, args.ffprobe)
        video.with_suffix(".json").write_text(json.dumps(index, separators=(",", ":")) + "\n")
