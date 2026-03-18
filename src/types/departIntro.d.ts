declare module "*departIntro.js" {
  export interface DepartProject {
    projectId: string;
    title: string;
    contents: string[];
  }

  export interface DepartBureau {
    id: string;
    name: string;
    description: string;
    projects: DepartProject[];
  }

  export const bureauData: DepartBureau[];
}
