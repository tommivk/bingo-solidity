import { ethers } from "ethers";
import { toast } from "react-toastify";
import { writeContract, prepareWriteContract } from "@wagmi/core";
import { BingoFactoryContractData } from "../types";
import { parseErrorMessage } from "../util";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import Button from "./Button";
import Input from "./FormInput";
import * as yup from "yup";

type Props = {
  contractData: BingoFactoryContractData;
  setModalOpen: (open: boolean) => void;
};

const NewGameForm = ({ contractData, setModalOpen }: Props) => {
  const [loading, setIsLoading] = useState(false);

  const FormSchema = yup.object().shape({
    ticketCost: yup.number().min(0).typeError("Bet is required"),
    minPlayers: yup
      .number()
      .min(1, "Min value is 1")
      .max(255, "Max value is 255")
      .typeError("Min players is required"),
    maxPlayers: yup
      .number()
      .min(1, "Min value is 1")
      .max(255, "Max value is 255")
      .typeError("Max players is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    mode: "onBlur",
    defaultValues: {
      ticketCost: 0.0002,
      minPlayers: 1,
      maxPlayers: 5,
    },
  });

  const handleCreateGame = async (formData: any) => {
    try {
      setIsLoading(true);
      const { minPlayers, maxPlayers, ticketCost: ticketCostWei } = formData;
      const ticketCost = ethers.utils.parseUnits(
        ticketCostWei.toString(),
        "ether"
      );

      const config = await prepareWriteContract({
        ...contractData,
        functionName: "createRoom",
        overrides: {
          value: ticketCost,
        },
        args: [ticketCost, minPlayers, maxPlayers],
      });

      const data = await writeContract(config);
      await data.wait();
      setModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(
        parseErrorMessage(error.message) ??
          parseErrorMessage(error.stack, "Failed to create game")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-center">Create New Game</h1>
      <form onSubmit={handleSubmit((data) => handleCreateGame(data))}>
        <table>
          <tbody>
            <tr>
              <th className="text-left pb-1">Bet</th>
            </tr>
            <tr>
              <td>
                <Input
                  type="number"
                  step={0.000001}
                  allowNegative={false}
                  {...register("ticketCost")}
                />
                <ErrorText error={errors.ticketCost} />
              </td>
              <td className="font-semibold pl-2">MATIC</td>
            </tr>
            <tr className="h-2" />
            <tr>
              <th className="text-left pb-1">Min players</th>
            </tr>
            <tr>
              <td>
                <Input
                  className="w-full"
                  type="number"
                  allowNegative={false}
                  allowDecimals={false}
                  {...register("minPlayers")}
                />
                <ErrorText error={errors.minPlayers} />
              </td>
            </tr>
            <tr className="h-2" />
            <tr>
              <th className="text-left pb-1">Max players</th>
            </tr>
            <tr>
              <td>
                <Input
                  className="w-full"
                  type="number"
                  allowNegative={false}
                  allowDecimals={false}
                  {...register("maxPlayers")}
                />
                <ErrorText error={errors.maxPlayers} />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-center">
          <Button
            type="submit"
            className="flex justify-center mt-8"
            loading={loading}
          >
            Create Game
          </Button>
        </div>
      </form>
    </>
  );
};

const ErrorText = ({ error }: any) => {
  return (
    <p className="text-red-500 text-center pt-1 text-sm">
      {error && error.message?.toString()}
    </p>
  );
};

export default NewGameForm;
