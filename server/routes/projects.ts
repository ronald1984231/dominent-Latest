import { RequestHandler } from "express";
import { 
  Project, 
  CreateProjectRequest, 
  CreateProjectResponse, 
  GetProjectsResponse 
} from "@shared/internal-api";

// In-memory storage for demonstration (in production, use a real database)
let projects: Project[] = [
  {
    id: "1",
    name: "Googleplex Network Domains",
    description: "Main project for Googleplex network domain management",
    teamCount: 0,
    domainCount: 26,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Flight Domains",
    description: "Aviation related domain portfolio",
    teamCount: 0,
    domainCount: 37,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Get all projects
export const getProjects: RequestHandler = (req, res) => {
  const response: GetProjectsResponse = {
    projects: projects,
    total: projects.length
  };
  res.json(response);
};

// Create a new project
export const createProject: RequestHandler = (req, res) => {
  const { name, description }: CreateProjectRequest = req.body;

  if (!name || !name.trim()) {
    const response: CreateProjectResponse = {
      success: false,
      error: "Project name is required"
    };
    return res.status(400).json(response);
  }

  // Check if project with same name already exists
  const existingProject = projects.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existingProject) {
    const response: CreateProjectResponse = {
      success: false,
      error: "A project with this name already exists"
    };
    return res.status(409).json(response);
  }

  // Create new project
  const newProject: Project = {
    id: Date.now().toString(),
    name: name.trim(),
    description: description?.trim() || undefined,
    teamCount: 0,
    domainCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.push(newProject);

  const response: CreateProjectResponse = {
    success: true,
    project: newProject
  };

  res.json(response);
};

// Update a project
export const updateProject: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Validate name if provided
  if (updates.name) {
    const existingProject = projects.find(p => 
      p.id !== id && p.name.toLowerCase() === updates.name.toLowerCase()
    );
    if (existingProject) {
      return res.status(409).json({ error: "A project with this name already exists" });
    }
  }

  projects[projectIndex] = {
    ...projects[projectIndex],
    ...updates,
    id: id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };

  res.json({ success: true, project: projects[projectIndex] });
};

// Delete a project
export const deleteProject: RequestHandler = (req, res) => {
  const { id } = req.params;

  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: "Project not found" });
  }

  const project = projects[projectIndex];
  
  // Check if project has domains (in real app, you might want to prevent deletion or transfer domains)
  if (project.domainCount > 0) {
    return res.status(400).json({ 
      error: `Cannot delete project with ${project.domainCount} domains. Please transfer or remove domains first.` 
    });
  }

  projects.splice(projectIndex, 1);
  res.json({ success: true });
};

// Get project details including domains and team members
export const getProjectDetails: RequestHandler = (req, res) => {
  const { id } = req.params;

  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  // In a real application, you would fetch associated domains and team members
  const projectDetails = {
    ...project,
    domains: [], // Would fetch actual domains associated with this project
    teamMembers: [], // Would fetch actual team members
    recentActivity: [] // Would fetch recent activity for this project
  };

  res.json(projectDetails);
};

// Add domain to project
export const addDomainToProject: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { domainId } = req.body;

  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: "Project not found" });
  }

  // In a real application, you would:
  // 1. Validate that the domain exists
  // 2. Check user permissions
  // 3. Add the association in the database
  // 4. Update domain count

  projects[projectIndex].domainCount += 1;
  projects[projectIndex].updatedAt = new Date().toISOString();

  res.json({ 
    success: true, 
    message: "Domain added to project successfully",
    project: projects[projectIndex]
  });
};

// Remove domain from project
export const removeDomainFromProject: RequestHandler = (req, res) => {
  const { id, domainId } = req.params;

  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: "Project not found" });
  }

  // In a real application, you would validate the domain association exists
  if (projects[projectIndex].domainCount > 0) {
    projects[projectIndex].domainCount -= 1;
    projects[projectIndex].updatedAt = new Date().toISOString();
  }

  res.json({ 
    success: true, 
    message: "Domain removed from project successfully",
    project: projects[projectIndex]
  });
};
