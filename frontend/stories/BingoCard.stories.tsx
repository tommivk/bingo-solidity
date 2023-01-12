import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import BingoCard from "../components/BingoCard";

export default {
  title: "Bingo card",
  component: BingoCard,
  argTypes: {
    size: {
      options: ["small", "large"],
      control: "radio",
    },
  },
} as ComponentMeta<typeof BingoCard>;

const Template: ComponentStory<typeof BingoCard> = (args) => (
  <BingoCard {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  card: Array.from(Array(25).keys()),
  numbersDrawn: [],
  size: "large",
};

export const AllDrawn = Template.bind({});
AllDrawn.args = {
  card: Array.from(Array(25).keys()),
  numbersDrawn: Array.from(Array(25).keys()),
};

export const SmallCard = Template.bind({});
SmallCard.args = {
  size: "small",
  card: Array.from(Array(25).keys()),
  numbersDrawn: [],
};

export const SmallCardAllDrawn = Template.bind({});
SmallCardAllDrawn.args = {
  size: "small",
  card: Array.from(Array(25).keys()),
  numbersDrawn: Array.from(Array(25).keys()),
};
