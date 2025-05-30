# Audio Files for Routinize Fitness App

This directory contains audio files for the wellness and meditation modules.

## Directory Structure

```
public/sounds/
├── README.md
├── meditation/
│   ├── bell.mp3                    # Meditation bell sound
│   ├── tibetan-bowls.mp3          # Tibetan singing bowls
│   └── meditation-bell.mp3        # Alternative bell sound
├── ambient/
│   ├── forest-ambience.mp3        # Forest sounds
│   ├── ocean-waves.mp3            # Ocean wave sounds
│   ├── gentle-rain.mp3            # Rain sounds
│   ├── gentle-wind.mp3            # Wind sounds
│   └── birds-chirping.mp3         # Bird sounds
└── breathing/
    ├── inhale-cue.mp3             # Breathing inhale cue
    ├── exhale-cue.mp3             # Breathing exhale cue
    └── breath-bell.mp3            # Breathing exercise bell
```

## File Specifications

### Audio Format
- **Format**: MP3
- **Quality**: 128-192 kbps
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo (preferred) or Mono

### File Sizes
- Keep files under 5MB each for optimal loading
- Ambient sounds should be 2-5 minutes long and seamlessly loopable
- Bell sounds should be 3-10 seconds
- Breathing cues should be 1-3 seconds

## Usage in Components

### Meditation Module
- `enhanced-meditation-module.tsx` uses ambient sounds for background
- Bell sounds for session start/end notifications
- Tibetan bowls for specific meditation types

### Breathing Exercises
- `enhanced-breathing-exercises.tsx` uses ambient sounds
- Breathing cues for guided breathing patterns
- Bell sounds for phase transitions

### Wellness Module
- General ambient sounds for relaxation
- Bell sounds for mindfulness exercises

## Audio Sources

For production use, ensure all audio files are:
1. **Royalty-free** or properly licensed
2. **High quality** and professionally recorded
3. **Optimized** for web delivery
4. **Accessible** (consider users with hearing impairments)

## Recommended Audio Libraries

### Free Resources
- **Freesound.org** - Community-driven sound library
- **Zapsplat** - Professional sound effects (free tier available)
- **YouTube Audio Library** - Royalty-free music and sounds

### Paid Resources
- **AudioJungle** - Professional audio marketplace
- **Pond5** - Stock audio and music
- **Epidemic Sound** - Subscription-based music library

## Implementation Notes

### Loading Strategy
- Use lazy loading for large ambient files
- Preload short bell sounds for immediate playback
- Implement fallback for unsupported audio formats

### Browser Compatibility
- MP3 is supported by all modern browsers
- Consider OGG Vorbis as fallback for older browsers
- Test audio playback on mobile devices

### Performance Optimization
- Compress audio files appropriately
- Use audio sprites for multiple short sounds
- Implement audio caching strategies

## Placeholder Files

Until actual audio files are added, the components will:
1. Show audio controls but may not play sound
2. Log warnings in development console
3. Gracefully handle missing audio files
4. Continue to function without audio

## Adding New Audio Files

1. Place files in appropriate subdirectories
2. Update component imports if needed
3. Test audio playback across devices
4. Verify file sizes and loading performance
5. Update this README with new file descriptions

## Accessibility Considerations

- Provide visual indicators when audio is playing
- Include volume controls for all audio
- Offer audio descriptions for important sound cues
- Ensure audio doesn't auto-play without user consent
- Provide alternatives for users who cannot hear audio

## Legal Compliance

- Ensure all audio files comply with copyright laws
- Maintain proper attribution for Creative Commons content
- Keep licenses and attribution information in a separate file
- Regularly audit audio content for compliance

---

**Note**: This directory structure supports the enhanced meditation and breathing exercise features in the Routinize fitness app. All audio files should be optimized for web delivery and mobile compatibility.
