import { CustomThemeControl } from "@/components/onboarding/custom-theme-control";
import { ThemeChoiceCard } from "@/components/onboarding/theme-choice-card";
import { Card } from "@/components/ui/card";
import { THEME_OPTIONS } from "@/lib/theme-options";
import { clientThemes } from "@/lib/themes";
import type { ThemeName } from "@/types";

export function StudioThemeSection({
  selectedTheme,
  customHexInput,
  validCustomPrimary,
  customError,
  onSelectTheme,
  onCustomTextChange,
  onCustomColourChange,
}: {
  selectedTheme: ThemeName;
  customHexInput: string;
  validCustomPrimary: string;
  customError: boolean;
  onSelectTheme: (theme: ThemeName) => void;
  onCustomTextChange: (value: string) => void;
  onCustomColourChange: (value: string) => void;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="eyebrow">03 · Client theme</p>
      <h2 className="section-title mt-3">Your client-facing visual signature.</h2>
      <p className="caption mt-2">Rovei app chrome stays consistent. Only client-facing experiences use this theme.</p>
      <fieldset className="mt-5">
        <legend className="sr-only">Choose the studio client theme</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {THEME_OPTIONS.map((option) => (
            <ThemeChoiceCard
              key={option.id}
              themeName={option.id}
              theme={clientThemes[option.id]}
              description={option.description}
              selected={selectedTheme === option.id}
              onSelect={() => onSelectTheme(option.id)}
            />
          ))}
        </div>
      </fieldset>
      {selectedTheme === "custom" && (
        <CustomThemeControl
          textValue={customHexInput}
          activeColour={validCustomPrimary}
          showError={customError}
          onTextChange={onCustomTextChange}
          onColourChange={onCustomColourChange}
        />
      )}
    </Card>
  );
}
