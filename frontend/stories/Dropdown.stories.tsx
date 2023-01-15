import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import Dropdown from "../components/Dropdown";
import { ethers } from "ethers";

export default {
  title: "Dropdown",
  component: Dropdown,
  argTypes: {},
} as ComponentMeta<typeof Dropdown>;

const Template: ComponentStory<typeof Dropdown> = (args) => (
  <div style={{ width: "fit-content", marginLeft: "auto" }}>
    <Dropdown {...args} />
  </div>
);

export const WithBalance = Template.bind({});
WithBalance.args = {
  address: "0x6734c98722C847C329958E9130a7fE4B763d22f3",
  balance: {
    decimals: 18,
    formatted: "22.234523",
    symbol: "MATIC",
    value: ethers.BigNumber.from("22"),
  },
};

export const WithoutBalance = Template.bind({});
WithoutBalance.args = {
  address: "0x6734c98722C847C329958E9130a7fE4B763d22f3",
  balance: {
    decimals: 18,
    formatted: "0.0",
    symbol: "MATIC",
    value: ethers.BigNumber.from("0"),
  },
};
