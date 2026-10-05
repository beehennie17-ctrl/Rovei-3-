import type { ClientTheme } from "@/types";

const lockedWineTheme: ClientTheme = {
  name: "Wine",
  primary: "#941651",
  onPrimary: "#FFFFFF",
  secondary: "#EECBD1",
  background: "#FBF6F7",
  surface: "#FFFFFF",
  text: "#2C171D",
  muted: "#7D6269",
  border: "#941651",
  shimmer: "rgba(255,255,255,.16)",
};

export function LockedClientPreview({
  studioName = "Your studio",
  clientName = "Your client",
  service = "Your appointment",
  modules = [],
  theme = lockedWineTheme,
}: {
  studioName?: string;
  clientName?: string;
  service?: string;
  modules?: string[];
  theme?: ClientTheme;
}) {
  return (
    <div className="rovei-preview-frame">
      <div className="rovei-preview-label">Live client preview</div>

      <div className="rovei-phone">
        <div className="rovei-phone-inner">
          <div className="rovei-phone-top">
            <div className="rovei-notch" />
          </div>

          <div
            className="rovei-client-hero"
            style={{
              backgroundColor: theme.primary,
              color: theme.onPrimary,
            }}
          >
            <div className="rovei-studio-mini">{studioName}</div>
            <h3>Hi {clientName}.</h3>
            <p>Let&apos;s get you ready for your appointment.</p>
          </div>

          <div className="rovei-phone-body">
            <div className="rovei-mini-row">
              <div>
                <strong>{service}</strong>
                <br />
                <span>Prepared before arrival</span>
              </div>
              <span>Rovei.</span>
            </div>

            {modules.length > 0 ? (
              modules.map((module) => (
                <div className="rovei-mini-row" key={module}>
                  <strong>{module}</strong>
                  <span>Ready to complete</span>
                </div>
              ))
            ) : (
              <div className="rovei-preview-empty">
                Your selected client modules will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
