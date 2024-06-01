/* eslint-disable prettier/prettier */
"use client";

import { setStore } from "~~/utils/store";

const determineWinner = (throw1: string, throw2: string) => {
  console.log(throw1, throw2)
  if (throw1 === throw2) {
    console.log('is draw')
    return "draw";
  }

  if (
    (throw1 === "r" && throw2 === "s") ||
    (throw1 === "s" && throw2 === "p") ||
    (throw1 === "p" && throw2 === "r")
  ) {
    return "player1";
  } else {
    return "player2";
  }
};
const winLossRecord = ({ throws1 = [], throws2 = [] }: { throws1: any; throws2: any }) => {
  return throws1.map((throw1: any, i: string | number) => determineWinner(throw1, throws2[i]));
};
const Player = ({
  text,
  addressOfUser,
  storeKey,
  player,
  match,
  refreshMatch,
}: {
  text: string | undefined;
  addressOfUser: string;
  storeKey: string;
  player: string;
  match: any;
  refreshMatch: () => void;
}) => {
  const round = match.round || 0;
  const isPlayer = match[player].address === addressOfUser;
  const otherPlayer = player === "player1" ? match.player2 : match.player1;
  const myThrows = match[player].throws;
  const alreadyThrown = round < myThrows.length;
  const winLosses = winLossRecord({ throws1: match.player1.throws, throws2: match.player2.throws });
  const bothHaveGone = match.player1.throws.length === match.player2.throws.length;
  // console.log("already", alreadyThrown, match.round, match[player].throws.length);
  const handleThrow = ({ throwValue }: { throwValue: any }) => {
    debugger;
    const mutablePlayer = { ...match[player] };
    const updatedData = {
      ...match,
      [player]: {
        ...mutablePlayer,
        throws: [...mutablePlayer.throws, throwValue],
      }
    };
    const _bothHaveGone = updatedData[player].throws.length <= otherPlayer.throws.length;
    if (_bothHaveGone) updatedData.round++;
    // updatedData.round = 4;
    debugger;
    setStore({
      key: storeKey,
      data: updatedData,
    });
    refreshMatch();
  };
  console.log("player", !isPlayer, alreadyThrown, bothHaveGone);
  // const buttonDisabled = !isPlayer || (alreadyThrown && !bothHaveGone)
  const buttonDisabled = !isPlayer;
  debugger;
  return (
    <div className={`flex items-center`}>
      {/* {JSON.stringify(match[player].throws)} */}
      <div className="dropdown">
        <div tabIndex={0} role="button" className={`m-1 btn ${buttonDisabled ? "btn-disabled" : ""}`}>{text}</div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <li onClick={() => handleThrow({ throwValue: "r" })}>
            <a>rock</a>
          </li>
          <li onClick={() => handleThrow({ throwValue: "p" })}>
            <a>paper</a>
          </li>
          <li onClick={() => handleThrow({ throwValue: "s" })}>
            <a>scissors</a>
          </li>
        </ul>
      </div>
      {match[player].throws.map((throwValue: any, i: number) => {
        const moreThrowsThanCount = i > round;
        const moreThrowsThanOpponent = myThrows.length > otherPlayer.throws.length
        const keepSecret = moreThrowsThanCount && moreThrowsThanOpponent
        const backgroundColor =
          keepSecret || winLosses[i] === 'draw'
            ? "bg-gray-200"
            : winLosses[i] === player
              ? `bg-green-400`
              : `bg-red-400`;
        debugger;
        return (
          <div key={i} className={`flex justify-center items-center w-6 h-6 ${backgroundColor}`}>
            {keepSecret ? '?' : throwValue}
          </div>
        );
      })}
    </div>
  );
};

export default Player;