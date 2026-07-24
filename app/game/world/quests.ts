import { CAMP, MOUNTAIN_GATE, PLAZA } from "./terrain";

export type QuestStage =
  | "REACH_VILLAGE"
  | "TALK_ELDER"
  | "CLEAR_CAMP"
  | "FREE_TRAVELER"
  | "ROAD_OPEN"
  | "COMPLETE";

export type QuestView = {
  title: string;
  detail: string;
  objective: [number, number] | null;
};

const VIEWS: Record<QuestStage, QuestView> = {
  REACH_VILLAGE: {
    title: "Road Through Amani",
    detail: "Follow the dirt road south into Amani village.",
    objective: PLAZA,
  },
  TALK_ELDER: {
    title: "Word at the Well",
    detail: "Speak with Elder Naiara by the village well.",
    objective: PLAZA,
  },
  CLEAR_CAMP: {
    title: "Trouble on the Mountain Road",
    detail: "Bandits ambushed a traveler on the mountain road. Stop them at their camp.",
    objective: CAMP,
  },
  FREE_TRAVELER: {
    title: "The Captive Traveler",
    detail: "The bandits are beaten. Free the traveler at the camp.",
    objective: CAMP,
  },
  ROAD_OPEN: {
    title: "The Road Is Open",
    detail: "Walk the cleared road to the mountain gate.",
    objective: MOUNTAIN_GATE,
  },
  COMPLETE: {
    title: "Region Secured",
    detail: "Amani village and the mountain road are safe. More of the world lies ahead.",
    objective: null,
  },
};

export class QuestLine {
  stage: QuestStage = "REACH_VILLAGE";

  get view(): QuestView {
    return VIEWS[this.stage];
  }

  advance(to: QuestStage) {
    this.stage = to;
  }
}
