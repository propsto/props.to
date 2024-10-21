import { type JSX } from "react";
import { Button } from "@propsto/ui/atoms";
import { defineStepper } from "@stepperize/react";

const { useStepper, Scoped } = defineStepper(
  { id: "first", title: "First" },
  { id: "second", title: "Second" },
  { id: "third", title: "Third" },
  { id: "last", title: "Last" },
);

function App(): JSX.Element {
  return (
    <div className="flex flex-col gap-4 bg-gray-3 p-4 my-4 rounded-md w-[400px]">
      <Scoped>
        <MySteps />
        <MyActions />
      </Scoped>
    </div>
  );
}

function MySteps(): JSX.Element {
  const stepper = useStepper();

  return (
    <div className="text-start">
      {stepper.when("first", step => (
        <span>This is the {step.id} step. So it begins.</span>
      ))}

      {stepper.when("second", step => (
        <span>This is the {step.id} step.</span>
      ))}

      {stepper.when("third", step => (
        <span>This is the {step.id} step.</span>
      ))}

      {stepper.when("last", step => (
        <span>This is the {step.id} step. So it ends.</span>
      ))}
    </div>
  );
}

function MyActions(): JSX.Element {
  const stepper = useStepper();

  return !stepper.isLast ? (
    <div className="flex items-center gap-2">
      <Button onClick={stepper.prev} disabled={stepper.isFirst}>
        Previous
      </Button>

      <Button onClick={stepper.next}>
        {stepper.when(
          "third",
          () => "Finish",
          () => "Next",
        )}
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button onClick={stepper.reset}>Reset</Button>
    </div>
  );
}

export default App;
