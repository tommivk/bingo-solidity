import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import GameInfoCard from "../components/GameInfoCard";
import { GameState } from "../types";
import { ethers } from "ethers";

export default {
  title: "GameInfoCard",
  component: GameInfoCard,
  args: {
    winners: [],
  },
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

const gameState: GameState = {
  ticketCost: ethers.BigNumber.from("20000000000000000"),
  minPlayers: 1,
  maxPlayers: 5,
  totalNumbersDrawn: 5,
  bingoCallPeriod: 200,
  winnerCount: 1,
  bingoFoundTime: ethers.BigNumber.from("0"),
  gameStatus: 2,
  joinedPlayers: [ethers.constants.AddressZero],
};

export const withWinners = Template.bind({});
withWinners.args = {
  allBingoCards: [card, card, card, card, card, card, card, card, card],
  numbersDrawn: [0, 2, 14, 18, 10],
  winners: [ethers.constants.AddressZero],
  gameFee: ethers.BigNumber.from("30000000000000"),
  gameState,
};
