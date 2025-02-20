# Art Interpretation

## Get started

If you don't have React Native/Expo installed, follow [React Native Mobile App Development Guide](https://docs.google.com/document/d/1Eq96WBHj0CTAoZtGRIZLulZJAsuEU8nfE8gnP0eY2Ho/edit?usp=sharing). Overwise, steps listed below:

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the server

   ```bash
    npm run server
   ```

3. Start the app (in new terminal)

   ```bash
    npx expo start
   ```

If the server is not connecting, it could be because you need to update the local IP address that is used for the server. Open a terminal and run

```bash
 ipconfig getifaddr en0
```

This should output an IP address. Replace the IP address on line 4 in `scripts/request-server.js` with this address.

## Useful Links

- [React Native Mobile App Development Guide](https://docs.google.com/document/d/1Eq96WBHj0CTAoZtGRIZLulZJAsuEU8nfE8gnP0eY2Ho/edit?usp=sharing)
- [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio-av/)
- [OpenAi API Guide](https://platform.openai.com/docs/api-reference/authentication)
- [AudioLDM 2: A General Framework for Audio, Music, and Speech Generation](https://huggingface.co/spaces/haoheliu/audioldm2-text2audio-text2music)

From Expo:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
