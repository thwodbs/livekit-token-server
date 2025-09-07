import express from "express";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitHost = process.env.LIVEKIT_HOST; // 예: https://<sub>.livekit.cloud

app.get("/health", (_req, res) => res.send("ok"));

app.post("/token", async (req, res) => {
  try {
    const { roomName, identity, publish = false, name } = req.body;

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name,
      ttl: "10m"
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: !!publish,
      canSubscribe: true
    });

    const token = await at.toJwt();
    const wsUrl = livekitHost.replace("https://", "wss://");
    res.json({ token, wsUrl });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("token server on :" + PORT));
