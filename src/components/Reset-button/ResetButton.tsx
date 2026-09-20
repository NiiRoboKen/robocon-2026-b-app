type ResetButtonProps = {
  onReset: () => void;
};

const ResetButton = ({ onReset }: ResetButtonProps) => {
  return (
    <button
      onClick={onReset}
      style={{
        width: "100%",

        background: "#F8B400",
      }}
    >
      Reset Position
    </button>
  );
};

export default ResetButton;
