import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import Button from "../components/Button";

export default {
  title: "Button",
  component: Button,
  children: "hello",
  argTypes: {
    loading: {
      defaultValue: false,
      options: [true, false],
      control: { type: "radio" },
    },
    disabled: {
      defaultValue: false,
      options: [true, false],
      control: { type: "radio" },
    },
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  loading: false,
  children: "Hello",
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
  children: "Button",
};

export const Disabled = Template.bind({});
Disabled.args = {
  children: "Button",
  disabled: true,
};
