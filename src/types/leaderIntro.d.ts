declare module "*leaderIntro.js" {
  export interface LeaderGreeting {
    id: string;
    role: string;
    name: string;
    content: string;
  }

  export const greetingData: LeaderGreeting[];
}
