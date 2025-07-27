import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

const AIImageGenerator = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [customRequirements, setCustomRequirements] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const basePrompt = `You are a creative social media designer with expertise in crafting visually engaging content tailored for various themes and platforms. Based on the description of the user's content, generate a set of social media post designs that harmonize compelling visuals with effective messaging to meet specific engagement goals. Consider the following guidelines:

### Design Objectives:
- **Engagement Maximization**: Focus on creating high-engagement posts that increase reach and interaction.
- **Brand Awareness**: Ensure that the designs amplify brand recognition and consistency.

### Key Elements to Include:
1. **Visual Appeal**:
   - Use attention-grabbing imagery that resonates with the target audience.
   - Incorporate elements of color psychology to evoke desired emotions.

2. **Message Clarity**:
   - Develop clear and concise brand messaging that communicates value effectively.
   - Include compelling headlines and clear value propositions.

3. **Platform Optimization**:
   - Tailor the layout for the specific social media platform, considering its unique requirements (e.g., dimensions, format).
   - Utilize platform algorithms to enhance organic performance.

4. **Engagement Features**:
   - Pose engaging questions to stimulate conversation.
   - Integrate trending hashtags relevant to the content theme.
   - Add a clear call-to-action that prompts user interaction.

### Additional Considerations:
- **Target Audience Analysis**: Understand the audience demographics and preferences to guide content tone and design style.
- **Best Practices Implementation**: Follow social media strategies for visual hierarchy, readability, and optimal engagement.
- **Cross-Platform Adaptability**: Ensure designs are versatile and maintain consistency in branding across different social media platforms.

### User's Specific Requirements:
- Craft a **product showcase post** that effectively highlights the features of a new offering using **lifestyle imagery** to enhance relatability and appeal across any chosen platform.`;

  const generateImage = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your OpenAI API key");
      return;
    }

    setIsGenerating(true);
    
    try {
      const finalPrompt = customRequirements 
        ? `${basePrompt}\n\nAdditional User Requirements:\n${customRequirements}`
        : basePrompt;

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: finalPrompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to generate image");
      }

      const data = await response.json();
      const newImage: GeneratedImage = {
        url: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      toast.success("Image generated successfully!");

    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-media-design-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-glow" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Social Media Designer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate stunning social media content designs powered by AI. Create engaging posts that maximize reach and interaction.
          </p>
        </div>

        {/* Configuration Panel */}
        <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                OpenAI API Key
              </Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your OpenAI API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-sm font-medium">
                Additional Requirements (Optional)
              </Label>
              <Textarea
                id="requirements"
                placeholder="Add any specific requirements, product details, brand guidelines, or customizations..."
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={generateImage}
              disabled={isGenerating || !apiKey.trim()}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Design...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Social Media Design
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Generated Designs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image, index) => (
                <Card key={index} className="overflow-hidden border-border bg-card/50 backdrop-blur-sm hover:shadow-glow-primary transition-all duration-300">
                  <div className="relative group">
                    <img
                      src={image.url}
                      alt={`Generated social media design ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        onClick={() => downloadImage(image.url, index)}
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 backdrop-blur-sm border-white/30"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  {image.revisedPrompt && (
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">
                        <strong>AI Interpretation:</strong> {image.revisedPrompt.slice(0, 150)}...
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Card className="p-6 border-border bg-card/30 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">How it Works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">1</div>
              <p><strong>Enter API Key:</strong> Provide your OpenAI API key to enable image generation.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">2</div>
              <p><strong>Customize (Optional):</strong> Add specific requirements, product details, or brand guidelines.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">3</div>
              <p><strong>Generate & Download:</strong> Click generate to create your design and download the result.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIImageGenerator;