import { useState } from "react";
import { InternalHeader } from "../components/InternalHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

interface DocSection {
  title: string;
  items: string[];
}

interface DocContent {
  title: string;
  content: string;
}

export default function Documentation() {
  const [selectedDoc, setSelectedDoc] = useState("general");

  const docSections: DocSection[] = [
    {
      title: "Getting set up",
      items: [
        "General",
        "Registrars", 
        "Introduction",
        "Aura",
        "CloudFlare",
        "My Newly",
        "General D",
        "Hosting",
        "Network",
        "Profiles",
        "DNS"
      ]
    },
    {
      title: "Notifications",
      items: [
        "Introduction",
        "Domains",
        "Hosting", 
        "Slack"
      ]
    }
  ];

  const docContents: Record<string, DocContent> = {
    general: {
      title: "DOMINENT Documentation",
      content: `Welcome to DOMINENT documentation. In this website we'll explore how to use DOMINENT functionalities.

You'll find step-by-step instructions and doesn't need much documentation.

We will explore how to connect and use registrar apis and how to set them in DOMINENT.

If you're new to DOMINENT, we recommend you follow these documentations.

We'll happily guide you through each step.

Need more help? Contact us at support@dominent.com`
    },
    registrars: {
      title: "Registrars Setup",
      content: `Learn how to connect your domain registrars to DOMINENT for automated domain management.

## Supported Registrars

- GoDaddy
- Namecheap  
- Cloudflare
- Domain.com
- And many more...

## Adding a Registrar

1. Navigate to My Registrars page
2. Click "Add Registrar API"
3. Select your registrar
4. Enter your API credentials
5. Test the connection

## API Requirements

Each registrar has different API requirements. Make sure you have the proper API access enabled in your registrar account before adding it to DOMINENT.`
    },
    introduction: {
      title: "Introduction to DOMINENT",
      content: `DOMINENT is a comprehensive domain monitoring and management platform designed to help you keep track of your domain portfolio.

## Key Features

- **Domain Monitoring**: Track expiration dates and renewal information
- **SSL Certificate Monitoring**: Monitor SSL certificate expiration
- **Multi-Registrar Support**: Connect multiple registrar accounts
- **Automated Notifications**: Get alerted before domains expire
- **Team Management**: Collaborate with team members
- **Project Organization**: Organize domains into projects

## Getting Started

1. Add your domains to monitor
2. Connect your registrar APIs for automated management
3. Configure notification preferences
4. Set up projects and team access

Start by exploring the Dashboard to see an overview of your domain portfolio.`
    },
    notifications_introduction: {
      title: "Notification Settings",
      content: `Configure how and when you want to be notified about important domain and certificate events.

## Notification Types

### Domain Expiration Alerts
Get notified when your domains are approaching expiration:
- 30 days before expiration
- 15 days before expiration  
- 7 days before expiration
- 1 day before expiration

### Certificate Expiration Alerts
Monitor SSL certificate expiration:
- 30 days before expiration
- 15 days before expiration
- 7 days before expiration
- 1 day before expiration

## Delivery Methods

### Email Notifications
Receive notifications via email to your registered address.

### Webhook Integration
Send notifications to your custom webhook endpoint for integration with your systems.

### Slack Integration
Get notifications directly in your Slack channels using webhook URLs.

## Free Tier Limits

Free tier includes up to 20 notifications per month. Upgrade for unlimited notifications and premium features.`
    }
  };

  const getCurrentContent = () => {
    return docContents[selectedDoc] || docContents.general;
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-muted/20 min-h-[calc(100vh-120px)] border-r">
          <div className="p-6">
            {docSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => {
                    const key = section.title === "Notifications" ? `notifications_${item.toLowerCase()}` : item.toLowerCase();
                    const isActive = selectedDoc === key;
                    
                    return (
                      <li key={itemIndex}>
                        <button
                          onClick={() => setSelectedDoc(key)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            isActive 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {getCurrentContent().title}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  Pricing
                </Button>
                <Button variant="outline" size="sm">
                  Login
                </Button>
                <Button size="sm">
                  Create Account
                </Button>
              </div>
            </div>

            {/* Content */}
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-gray max-w-none">
                  {getCurrentContent().content.split('\n\n').map((paragraph, index) => {
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-xl font-semibold text-foreground mt-8 mb-4">
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    } else if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-lg font-medium text-foreground mt-6 mb-3">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    } else if (paragraph.startsWith('- ')) {
                      const listItems = paragraph.split('\n');
                      return (
                        <ul key={index} className="list-disc list-inside space-y-1 mb-4">
                          {listItems.map((item, listIndex) => (
                            <li key={listIndex} className="text-muted-foreground">
                              {item.replace('- ', '')}
                            </li>
                          ))}
                        </ul>
                      );
                    } else if (paragraph.match(/^\d+\./)) {
                      const listItems = paragraph.split('\n');
                      return (
                        <ol key={index} className="list-decimal list-inside space-y-1 mb-4">
                          {listItems.map((item, listIndex) => (
                            <li key={listIndex} className="text-muted-foreground">
                              {item.replace(/^\d+\.\s/, '')}
                            </li>
                          ))}
                        </ol>
                      );
                    } else {
                      return (
                        <p key={index} className="text-muted-foreground mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    }
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button variant="outline">
                ← Previous
              </Button>
              <Button variant="outline">
                Next →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
