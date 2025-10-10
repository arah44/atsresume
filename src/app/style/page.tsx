import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Style Guide - ATSResume',
  description: 'Theme colors and design tokens',
};

interface ColorSwatchProps {
  name: string;
  variable: string;
  className?: string;
  textClassName?: string;
  showText?: boolean;
}

function ColorSwatch({ name, variable, className, textClassName, showText = true }: ColorSwatchProps) {
  return (
    <div className="space-y-2">
      <div
        className={`h-24 rounded-lg border ${className || ''} flex items-center justify-center`}
      >
        {showText && (
          <span className={`font-medium ${textClassName || ''}`}>
            {name}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{variable}</p>
      </div>
    </div>
  );
}

interface ColorPairSwatchProps {
  name: string;
  bgVariable: string;
  bgClass: string;
  fgClass: string;
}

function ColorPairSwatch({ name, bgVariable, bgClass, fgClass }: ColorPairSwatchProps) {
  return (
    <div className="space-y-2">
      <div className={`h-24 rounded-lg border ${bgClass} flex items-center justify-center px-4`}>
        <span className={`font-medium text-center ${fgClass}`}>
          Sample Text
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{bgVariable}</p>
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Style Guide</h1>
        <p className="text-muted-foreground">
          Theme colors and design tokens for ATSResume
        </p>
      </div>

      {/* Base Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Base Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ColorPairSwatch
            name="Background"
            bgVariable="--background"
            bgClass="bg-background"
            fgClass="text-foreground"
          />
          <ColorPairSwatch
            name="Foreground"
            bgVariable="--foreground"
            bgClass="bg-foreground"
            fgClass="text-background"
          />
        </div>
      </section>

      {/* Primary UI Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Primary UI Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ColorPairSwatch
            name="Primary"
            bgVariable="--primary"
            bgClass="bg-primary"
            fgClass="text-primary-foreground"
          />
          <ColorPairSwatch
            name="Secondary"
            bgVariable="--secondary"
            bgClass="bg-secondary"
            fgClass="text-secondary-foreground"
          />
          <ColorPairSwatch
            name="Accent"
            bgVariable="--accent"
            bgClass="bg-accent"
            fgClass="text-accent-foreground"
          />
          <ColorPairSwatch
            name="Muted"
            bgVariable="--muted"
            bgClass="bg-muted"
            fgClass="text-muted-foreground"
          />
        </div>
      </section>

      {/* Component Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Component Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ColorPairSwatch
            name="Card"
            bgVariable="--card"
            bgClass="bg-card"
            fgClass="text-card-foreground"
          />
          <ColorPairSwatch
            name="Popover"
            bgVariable="--popover"
            bgClass="bg-popover"
            fgClass="text-popover-foreground"
          />
          <ColorPairSwatch
            name="Destructive"
            bgVariable="--destructive"
            bgClass="bg-destructive"
            fgClass="text-destructive-foreground"
          />
        </div>
      </section>

      {/* Form Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Form Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ColorSwatch
            name="Border"
            variable="--border"
            className="border-4"
            showText={false}
          />
          <ColorSwatch
            name="Input"
            variable="--input"
            className="bg-input"
            showText={false}
          />
          <ColorSwatch
            name="Ring"
            variable="--ring"
            className="ring-4 ring-ring"
            showText={false}
          />
        </div>
      </section>

      {/* Chart Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Chart Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <ColorSwatch
            name="Chart 1"
            variable="--chart-1"
            className="bg-chart-1"
            showText={false}
          />
          <ColorSwatch
            name="Chart 2"
            variable="--chart-2"
            className="bg-chart-2"
            showText={false}
          />
          <ColorSwatch
            name="Chart 3"
            variable="--chart-3"
            className="bg-chart-3"
            showText={false}
          />
          <ColorSwatch
            name="Chart 4"
            variable="--chart-4"
            className="bg-chart-4"
            showText={false}
          />
          <ColorSwatch
            name="Chart 5"
            variable="--chart-5"
            className="bg-chart-5"
            showText={false}
          />
        </div>
      </section>

      {/* Sidebar Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Sidebar Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ColorPairSwatch
            name="Sidebar"
            bgVariable="--sidebar-background"
            bgClass="bg-sidebar"
            fgClass="text-sidebar-foreground"
          />
          <ColorPairSwatch
            name="Sidebar Primary"
            bgVariable="--sidebar-primary"
            bgClass="bg-sidebar-primary"
            fgClass="text-sidebar-primary-foreground"
          />
          <ColorPairSwatch
            name="Sidebar Accent"
            bgVariable="--sidebar-accent"
            bgClass="bg-sidebar-accent"
            fgClass="text-sidebar-accent-foreground"
          />
          <ColorSwatch
            name="Sidebar Border"
            variable="--sidebar-border"
            className="border-4 border-sidebar-border"
            showText={false}
          />
        </div>
      </section>

      {/* Typography Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Typography</h2>
        <Card>
          <CardHeader>
            <CardTitle>Heading Styles</CardTitle>
            <CardDescription>Various text sizes and weights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Heading 2</h2>
              <p className="text-sm text-muted-foreground">text-3xl font-bold</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">Heading 3</h3>
              <p className="text-sm text-muted-foreground">text-2xl font-bold</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">Heading 4</h4>
              <p className="text-sm text-muted-foreground">text-xl font-semibold</p>
            </div>
            <div>
              <p className="text-base">Body text - Regular paragraph text</p>
              <p className="text-sm text-muted-foreground">text-base</p>
            </div>
            <div>
              <p className="text-sm">Small text - Secondary information</p>
              <p className="text-sm text-muted-foreground">text-sm</p>
            </div>
            <div>
              <p className="text-xs">Extra small text - Captions and labels</p>
              <p className="text-sm text-muted-foreground">text-xs</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Border Radius */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Border Radius</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="h-24 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-medium">Small</span>
            </div>
            <p className="text-sm font-medium">rounded-sm</p>
            <p className="text-xs text-muted-foreground">calc(var(--radius) - 4px)</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-medium">Medium</span>
            </div>
            <p className="text-sm font-medium">rounded-md</p>
            <p className="text-xs text-muted-foreground">calc(var(--radius) - 2px)</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-medium">Large</span>
            </div>
            <p className="text-sm font-medium">rounded-lg</p>
            <p className="text-xs text-muted-foreground">var(--radius) = 0.5rem</p>
          </div>
        </div>
      </section>
    </main>
  );
}

