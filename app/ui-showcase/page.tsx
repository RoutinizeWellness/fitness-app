"use client"

import { useState } from "react"
import { RoutinizeLayout } from "@/components/routinize-layout"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { TipsCard } from "@/components/ui/tips-card"
import { CommunitySection } from "@/components/ui/community-section"
import { ProgressSteps } from "@/components/ui/progress-steps"
import { OrganicCard, OrganicCardHeader, OrganicCardTitle, OrganicCardContent, OrganicCardFooter, OrganicCardBadge } from "@/components/ui/organic-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sun, Moon, Droplets, Wind, ChevronRight } from "lucide-react"

export default function UIShowcasePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("components")
  const [currentStep, setCurrentStep] = useState(0)
  
  // Datos de ejemplo para los componentes
  const tips = [
    {
      id: "tip1",
      title: "Here comes the sun...",
      content: "Summer's coming! In short: more sun, more growth, more water needed!",
      icon: "sun",
      moreUrl: "#"
    },
    {
      id: "tip2",
      title: "Hydration is key",
      content: "Make sure to water your plants regularly, especially during hot days.",
      icon: "water",
      moreUrl: "#"
    },
    {
      id: "tip3",
      title: "Air circulation matters",
      content: "Good air flow prevents mold and helps strengthen plant stems.",
      icon: "wind",
      moreUrl: "#"
    }
  ]
  
  const communityMembers = [
    {
      id: "user1",
      name: "John Doe",
      avatarUrl: "https://ui-avatars.com/api/?name=John+Doe&background=random"
    },
    {
      id: "user2",
      name: "Jane Smith",
      avatarUrl: "https://ui-avatars.com/api/?name=Jane+Smith&background=random"
    },
    {
      id: "user3",
      name: "Bob Johnson",
      avatarUrl: "https://ui-avatars.com/api/?name=Bob+Johnson&background=random"
    }
  ]
  
  const progressSteps = [
    {
      id: "step1",
      title: "Creating your wallet"
    },
    {
      id: "step2",
      title: "Verifying your key"
    },
    {
      id: "step3",
      title: "Backing up to iCloud"
    },
    {
      id: "step4",
      title: "Connecting to your wallet"
    }
  ]
  
  // Cambiar al siguiente paso
  const handleNextStep = () => {
    setCurrentStep((prev) => (prev + 1) % progressSteps.length)
  }
  
  // Alternar modo oscuro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }
  
  return (
    <RoutinizeLayout>
      <div className={`container mx-auto p-4 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">UI Showcase</h1>
          <Button onClick={toggleDarkMode} variant="outline">
            {darkMode ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="avatars">Avatars</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* TipsCard */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Tips Card</h2>
                <TipsCard tips={tips} darkMode={darkMode} />
              </div>
              
              {/* CommunitySection */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Community Section</h2>
                <CommunitySection 
                  title="Community" 
                  tagName="#Pilea" 
                  members={communityMembers} 
                  memberCount={23410}
                  darkMode={darkMode}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ProgressSteps */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Progress Steps</h2>
                <div className="flex flex-col items-center">
                  <ProgressSteps 
                    steps={progressSteps} 
                    currentStepIndex={currentStep} 
                    isLoading={false}
                    accentColor="purple"
                    darkMode={darkMode}
                  />
                  <Button 
                    onClick={handleNextStep} 
                    className="mt-4"
                    variant="pill"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
              
              {/* OrganicCard */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Organic Card</h2>
                <OrganicCard 
                  backgroundColor="amber"
                  darkMode={darkMode}
                  animate={true}
                >
                  <OrganicCardHeader>
                    <OrganicCardBadge>New</OrganicCardBadge>
                    <OrganicCardTitle className="mt-2">
                      Organic Card Example
                    </OrganicCardTitle>
                  </OrganicCardHeader>
                  <OrganicCardContent>
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      This is an example of an organic card with rounded corners and a soft background.
                    </p>
                  </OrganicCardContent>
                  <OrganicCardFooter>
                    <Button variant="pill" size="sm" className="ml-auto">
                      Learn More <ChevronRight className="h-4 w-4" />
                    </Button>
                  </OrganicCardFooter>
                </OrganicCard>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="buttons" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="pill">Pill</Button>
                  <Button variant="organic">Organic</Button>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Button Sizes</h2>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon"><Sun /></Button>
                  <Button size="pill">Pill</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="avatars" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Avatar Sizes</h2>
                <div className="flex flex-wrap gap-4 items-center">
                  <Avatar size="xs">
                    <AvatarFallback>XS</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <Avatar size="md">
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <Avatar size="lg">
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                  <Avatar size="xl">
                    <AvatarFallback>XL</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Avatar Borders</h2>
                <div className="flex flex-wrap gap-4 items-center">
                  <Avatar bordered={true}>
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <Avatar bordered={true} borderColor="blue">
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                  <Avatar bordered={true} borderColor="green">
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                  <Avatar bordered={true} borderColor="amber">
                    <AvatarFallback>D</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Colorful Avatars</h2>
                <div className="flex flex-wrap gap-4 items-center">
                  <Avatar>
                    <AvatarFallback colorful={true}>A</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback colorful={true}>B</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback colorful={true}>C</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback colorful={true}>D</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback colorful={true}>E</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoutinizeLayout>
  )
}
