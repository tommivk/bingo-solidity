import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import GameInfoCard from "../components/GameInfoCard";

export default {
  title: "GameInfoCard",
  component: GameInfoCard,
} as ComponentMeta<typeof GameInfoCard>;

const Template: ComponentStory<typeof GameInfoCard> = (args) => (
  <GameInfoCard {...args} />
);

const card = Array.from(Array(25).keys());

export const Primary = Template.bind({});
Primary.args = {
  allBingoCards: [card, card, card, card, card, card, card, card, card],
  numbersDrawn: [0, 2, 14, 18, 10],
};

export const oneCard = Template.bind({});
oneCard.args = {
  allBingoCards: [card],
  numbersDrawn: [],
};
