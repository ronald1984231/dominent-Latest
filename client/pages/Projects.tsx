import { useState, useEffect } from "react";
import { InternalHeader } from "../components/InternalHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description?: string;
  teamCount: number;
  domainCount: number;
  createdAt: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: ""
  });
  const { toast } = useToast();

  // Starting with empty projects array - all sample data removed
  const mockProjects: Project[] = [];

  useEffect(() => {
    setProjects(mockProjects);
    setLoading(false);
  }, []);

  const handleAddProject = () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive"
      });
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      teamCount: 0,
      domainCount: 0,
      createdAt: new Date().toISOString()
    };

    setProjects(prev => [...prev, project]);
    setShowAddModal(false);
    setNewProject({ name: "", description: "" });
    
    toast({
      title: "Success",
      description: "Project created successfully",
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast({
      title: "Success",
      description: "Project deleted successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <InternalHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-success hover:bg-success/90 text-success-foreground">
                + ADD PROJECT
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Organize your domains and teams into projects for better management.
                </p>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <Label htmlFor="projectDescription">Description (Optional)</Label>
                  <Textarea
                    id="projectDescription"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProject}>
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  Loading projects...
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to start organizing your domains and teams.
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-6 p-6 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
                  <span className="col-span-2">NAME</span>
                  <span>TEAMS</span>
                  <span>DOMAINS</span>
                  <span></span>
                </div>

                {/* Table Rows */}
                {projects.map((project, index) => (
                  <div key={project.id} className={`grid grid-cols-5 gap-6 p-6 hover:bg-muted/30 transition-colors ${index !== projects.length - 1 ? 'border-b' : ''}`}>
                    <div className="col-span-2">
                      <div>
                        <div className="font-medium text-foreground">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground mt-1">{project.description}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground">{project.teamCount} Teams</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-foreground font-medium">{project.domainCount} Domains</span>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800">
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-destructive hover:text-destructive/80"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        {projects.length > 0 && (
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Project Management</h3>
            <p className="text-sm text-muted-foreground">
              Projects help you organize your domains and manage team access. You can assign specific domains to projects and invite team members to collaborate on domain management tasks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
