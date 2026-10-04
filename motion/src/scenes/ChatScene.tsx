import { useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { ChatBubble } from "../components/ChatBubble";
import { Icon } from "../components/Icon";
import { SceneShell } from "../components/SceneShell";
import { colors } from "../theme/colors";
import { copy } from "../theme/copy";
import { reveal } from "../theme/motion";

export function ChatScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const portrait = width < 1200;
  return (
    <SceneShell dark>
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          flexDirection: portrait ? "column-reverse" : "row",
          gap: portrait ? 100 : 130,
        }}
      >
        <div
          style={{
            width: portrait ? 910 : 720,
            height: portrait ? 1050 : 770,
            borderRadius: 38,
            background: colors.background,
            overflow: "hidden",
            boxShadow: `0 40px 100px ${colors.shadow}`,
            transform: `translateX(${(1 - reveal(frame, 15)) * -120}px)`,
          }}
        >
          <div
            style={{
              height: 105,
              display: "flex",
              gap: 20,
              alignItems: "center",
              padding: 27,
              background: colors.surface,
              color: colors.ink,
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 50,
                display: "grid",
                placeItems: "center",
                background: colors.pale,
              }}
            >
              <Icon name="person" size={30} />
            </div>{" "}
            Yasmim Sales{" "}
            <span
              style={{
                marginLeft: "auto",
                color: colors.success,
                fontSize: 18,
              }}
            >
              ● Online
            </span>
          </div>
          <div
            style={{
              height: "calc(100% - 190px)",
              display: "flex",
              flexDirection: "column",
              gap: 27,
              padding: 35,
            }}
          >
            <ChatBubble
              text="Olá! Consigo realizar amanhã às 14h."
              start={30}
            />
            <ChatBubble
              text="Ótimo! Pode trazer o material?"
              start={70}
              outgoing
            />
            <ChatBubble text="Sim, levo tudo que for necessário." start={110} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                alignSelf: "flex-end",
                padding: "15px 20px",
                borderRadius: 19,
                background: colors.pale,
                color: colors.teal,
                opacity: reveal(frame, 135),
              }}
            >
              <Icon name="camera" size={26} /> foto-do-serviço.jpg
            </div>
            <div
              style={{
                fontSize: 18,
                color: colors.muted,
                alignSelf: "flex-end",
                opacity: reveal(frame, 165),
              }}
            >
              Lida • 14:36
            </div>
          </div>
          <div
            style={{
              height: 85,
              margin: "0 25px",
              borderRadius: 24,
              border: `2px solid ${colors.border}`,
              background: colors.surface,
              color: colors.muted,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: 20,
              fontSize: 22,
            }}
          >
            <Icon name="paperclip" size={29} /> Mensagem...{" "}
            <span style={{ marginLeft: "auto" }}>
              <Icon name="arrow" size={29} />
            </span>
          </div>
        </div>
        <div style={{ maxWidth: portrait ? 900 : 770 }}>
          <div
            style={{
              color: colors.accent,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 5,
            }}
          >
            06 / CONVERSE
          </div>
          <div style={{ marginTop: 35 }}>
            <AnimatedText
              words={copy.chat.split(" ")}
              size={portrait ? 120 : 135}
              light
              start={40}
              accentIndex={3}
            />
          </div>
        </div>
      </div>
    </SceneShell>
  );
}
