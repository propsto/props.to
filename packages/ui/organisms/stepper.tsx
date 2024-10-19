"use client";

import { cva } from "class-variance-authority";
import { CheckIcon, Loader2, type LucideIcon, X } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Button } from "../atoms/button";
import { Collapsible, CollapsibleContent } from "../molecules/collapsible";

// <---------- CONTEXT ---------->

interface StepperContextValue extends StepperProps {
  clickable?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isVertical?: boolean;
  stepCount?: number;
  expandVerticalSteps?: boolean;
  activeStep: number;
  initialstep: number;
}

const StepperContext = React.createContext<
  StepperContextValue & {
    nextStep: () => void;
    prevStep: () => void;
    resetSteps: () => void;
    setStep: (step: number) => void;
  }
>({
  steps: [],
  activeStep: 0,
  initialstep: 0,
  nextStep: () => {
    return "";
  },
  prevStep: () => {
    return "";
  },
  resetSteps: () => {
    return "";
  },
  setStep: () => {
    return "";
  },
});

interface StepperContextProviderProps extends React.PropsWithChildren {
  value: Omit<StepperContextValue, "activeStep">;
}

function StepperProvider({
  value,
  children,
}: Readonly<StepperContextProviderProps>): JSX.Element {
  const isError = value.state === "error";
  const isLoading = value.state === "loading";

  const [activeStep, setActiveStep] = React.useState(value.initialstep);

  const nextStep = React.useCallback((): void => {
    setActiveStep(prev => prev + 1);
  }, []);

  const prevStep = React.useCallback((): void => {
    setActiveStep(prev => prev - 1);
  }, []);

  const resetSteps = React.useCallback((): void => {
    setActiveStep(value.initialstep);
  }, [value.initialstep]);

  const setStep = React.useCallback((step: number): void => {
    setActiveStep(step);
  }, []);

  const providerValue = React.useMemo(
    () => ({
      ...value,
      isError,
      isLoading,
      activeStep,
      nextStep,
      prevStep,
      resetSteps,
      setStep,
    }),
    [
      value,
      isError,
      isLoading,
      activeStep,
      nextStep,
      prevStep,
      resetSteps,
      setStep,
    ],
  );

  return (
    <StepperContext.Provider value={providerValue}>
      {children}
    </StepperContext.Provider>
  );
}

// <---------- HOOKS ---------->

function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>(undefined);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

interface UseStepper {
  isLastStep: boolean;
  hasCompletedAllSteps: boolean;
  isOptionalStep: boolean;
  isDisabledStep: boolean;
  currentStep: StepItem;
  previousActiveStep: number | undefined;
  clickable?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isVertical?: boolean;
  stepCount?: number;
  expandVerticalSteps?: boolean;
  activeStep: number;
  initialstep: number;
  steps: StepItem[];
  orientation?: "vertical" | "horizontal";
  state?: "loading" | "error";
  responsive?: boolean;
  checkIcon?: IconType;
  errorIcon?: IconType;
  onClickStep?: (step: number, setStep: (step: number) => void) => void;
  mobileBreakpoint?: string;
  variant?: "circle" | "circle-alt" | "line";
  size?: "sm" | "md" | "lg";
  styles?: StepOptions["styles"];
  variables?: {
    "--step-icon-size"?: string;
    "--step-gap"?: string;
  };
  scrollTracking?: boolean;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;
  setStep: (step: number) => void;
}

function useStepper(): UseStepper {
  const context = React.useContext(StepperContext);

  const { children: _, className: _1, ...rest } = context;

  const isLastStep = context.activeStep === context.steps.length - 1;
  const hasCompletedAllSteps = context.activeStep === context.steps.length;

  const previousActiveStep = usePrevious(context.activeStep);

  const currentStep = context.steps[context.activeStep];
  const isOptionalStep = Boolean(currentStep.optional);

  const isDisabledStep = context.activeStep === 0;

  return {
    ...rest,
    isLastStep,
    hasCompletedAllSteps,
    isOptionalStep,
    isDisabledStep,
    currentStep,
    previousActiveStep,
  };
}

function useMediaQuery(query: string): boolean {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent): void {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => {
      result.removeEventListener("change", onChange);
    };
  }, [query]);

  return value;
}

// <---------- STEPS ---------->

interface StepItem {
  id?: string;
  label?: string;
  description?: string;
  icon?: IconType;
  optional?: boolean;
}

interface StepOptions {
  orientation?: "vertical" | "horizontal";
  state?: "loading" | "error";
  responsive?: boolean;
  checkIcon?: IconType;
  errorIcon?: IconType;
  onClickStep?: (step: number, setStep: (step: number) => void) => void;
  mobileBreakpoint?: string;
  variant?: "circle" | "circle-alt" | "line";
  expandVerticalSteps?: boolean;
  size?: "sm" | "md" | "lg";
  styles?: {
    /** Styles for the main container */
    "main-container"?: string;
    /** Styles for the horizontal step */
    "horizontal-step"?: string;
    /** Styles for the horizontal step container (button and labels) */
    "horizontal-step-container"?: string;
    /** Styles for the vertical step */
    "vertical-step"?: string;
    /** Styles for the vertical step container (button and labels) */
    "vertical-step-container"?: string;
    /** Styles for the vertical step content */
    "vertical-step-content"?: string;
    /** Styles for the step button container */
    "step-button-container"?: string;
    /** Styles for the label and description container */
    "step-label-container"?: string;
    /** Styles for the step label */
    "step-label"?: string;
    /** Styles for the step description */
    "step-description"?: string;
  };
  variables?: {
    "--step-icon-size"?: string;
    "--step-gap"?: string;
  };
  scrollTracking?: boolean;
}
interface StepperProps extends StepOptions {
  children?: React.ReactNode;
  className?: string;
  initialstep: number;
  steps: StepItem[];
}

const VARIABLE_SIZES = {
  sm: "36px",
  md: "40px",
  lg: "44px",
};

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (props, ref: React.Ref<HTMLDivElement>) => {
    const childArr = React.Children.toArray(props.children);

    const items = [] as React.ReactElement[];

    const footer = childArr.map((child, _index) => {
      if (!React.isValidElement(child)) {
        throw new Error("Stepper children must be valid React elements.");
      }
      if (child.type === Step) {
        items.push(child);
        return null;
      }

      return child;
    });

    const stepCount = items.length;

    const isMobile = useMediaQuery(
      `(max-width: ${props.mobileBreakpoint ?? "768px"})`,
    );

    const clickable = Boolean(props.onClickStep);

    const orientation =
      isMobile && Boolean(props.responsive) ? "vertical" : props.orientation;

    const isVertical = orientation === "vertical";

    return (
      <StepperProvider
        value={{
          initialstep: props.initialstep,
          orientation,
          state: props.state,
          size: props.size,
          responsive: props.responsive,
          checkIcon: props.checkIcon,
          errorIcon: props.errorIcon,
          onClickStep: props.onClickStep,
          clickable,
          stepCount,
          isVertical,
          variant: props.variant ?? "circle",
          expandVerticalSteps: props.expandVerticalSteps,
          steps: props.steps,
          scrollTracking: props.scrollTracking,
          styles: props.styles,
        }}
      >
        <div
          className={cn(
            "stepper__main-container",
            "flex w-full flex-wrap",
            stepCount === 1 ? "justify-end" : "justify-between",
            orientation === "vertical" ? "flex-col" : "flex-row",
            props.variant === "line" && orientation === "horizontal" && "gap-4",
            props.className,
            props.styles?.["main-container"],
          )}
          ref={ref}
          style={
            {
              "--step-icon-size":
                props.variables?.["--step-icon-size"] ??
                VARIABLE_SIZES[props.size ?? "md"],
              "--step-gap": props.variables?.["--step-gap"] ?? "8px",
            } as React.CSSProperties
          }
          {...(({ className: _, styles: _1, ...rest }) => rest)(props)}
        >
          <VerticalContent>{items}</VerticalContent>
        </div>
        {orientation === "horizontal" && (
          <HorizontalContent>{items}</HorizontalContent>
        )}
        {footer}
      </StepperProvider>
    );
  },
);

Stepper.displayName = "Stepper";

function VerticalContent({
  children,
}: Readonly<React.PropsWithChildren>): JSX.Element {
  const { activeStep } = useStepper();

  const childArr = React.Children.toArray(children);
  const stepCount = childArr.length;

  return (
    <>
      {React.Children.map(children, (child, i) => {
        const isCompletedStep =
          React.isValidElement<StepProps>(child) &&
          child.props.isCompletedStep !== undefined
            ? child.props.isCompletedStep
            : i < activeStep;
        const isLastStep = i === stepCount - 1;
        const isCurrentStep = i === activeStep;

        const stepProps = {
          index: i,
          isCompletedStep,
          isCurrentStep,
          isLastStep,
        };

        if (React.isValidElement(child)) {
          return React.cloneElement(child, stepProps);
        }
        return null;
      })}
    </>
  );
}

interface NodeProps {
  children: React.ReactNode;
}

function HorizontalContent({
  children,
}: Readonly<React.PropsWithChildren>): JSX.Element | null {
  const { activeStep } = useStepper();
  const childArr = React.Children.toArray(children);

  if (activeStep >= childArr.length) {
    return null;
  }

  return (
    <>
      {React.Children.map(childArr[activeStep], node => {
        if (!React.isValidElement<NodeProps>(node)) {
          return null;
        }
        return React.Children.map(node.props.children, childNode => {
          if (React.isValidElement(childNode)) {
            return childNode;
          }
          return null;
        });
      })}
    </>
  );
}

// <---------- STEP ---------->

interface StepProps extends React.HTMLAttributes<HTMLLIElement> {
  label?: string | React.ReactNode;
  description?: string;
  icon?: IconType;
  state?: "loading" | "error";
  checkIcon?: IconType;
  errorIcon?: IconType;
  isCompletedStep?: boolean;
  isKeepError?: boolean;
  onClickStep?: (step: number, setStep: (step: number) => void) => void;
}

interface StepSharedProps extends StepProps {
  isLastStep?: boolean;
  isCurrentStep?: boolean;
  index?: number;
  hasVisited: boolean | undefined;
  isError?: boolean;
  isLoading?: boolean;
}

// Props which shouldn't be passed to to the Step component from the user
interface StepInternalConfig {
  index: number;
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isLastStep?: boolean;
}

const Step = React.forwardRef<HTMLDivElement, StepProps & StepInternalConfig>(
  (props, ref) => {
    const { isVertical, isError, isLoading, clickable } = useStepper();

    const hasVisited = props.isCurrentStep ?? props.isCompletedStep;

    const sharedProps = {
      isLastSte: props.isLastStep,
      isCompletedStep: props.isCompletedStep,
      isCurrentStep: props.isCurrentStep,
      index: props.index,
      isError,
      isLoading,
      clickable,
      label: props.label,
      description: props.description,
      hasVisited,
      icon: props.icon,
      isKeepError: props.isKeepError,
      checkIcon: props.checkIcon,
      state: props.state,
      errorIcon: props.errorIcon,
      onClickStep: props.onClickStep,
    };

    const renderStep = (): JSX.Element => {
      if (isVertical) {
        return (
          <VerticalStep ref={ref} {...sharedProps}>
            {props.children}
          </VerticalStep>
        );
      }
      return (
        <HorizontalStep ref={ref} {...sharedProps}>
          {props.children}
        </HorizontalStep>
      );
    };

    return renderStep();
  },
);

Step.displayName = "Step";

// <---------- VERTICAL STEP ---------->

type VerticalStepProps = StepSharedProps & {
  children?: React.ReactNode;
};

const verticalStepVariants = cva(
  [
    "flex flex-col relative transition-all duration-200",
    "data-[completed=true]:[&:not(:last-child)]:after:bg-primary",
    "data-[invalid=true]:[&:not(:last-child)]:after:bg-destructive",
  ],
  {
    variants: {
      variant: {
        circle: cn(
          "[&:not(:last-child)]:pb-[var(--step-gap)] [&:not(:last-child)]:gap-[var(--step-gap)]",
          "[&:not(:last-child)]:after:content-[''] [&:not(:last-child)]:after:w-[2px] [&:not(:last-child)]:after:bg-border",
          "[&:not(:last-child)]:after:inset-x-[calc(var(--step-icon-size)/2)]",
          "[&:not(:last-child)]:after:absolute",
          "[&:not(:last-child)]:after:top-[calc(var(--step-icon-size)+var(--step-gap))]",
          "[&:not(:last-child)]:after:bottom-[var(--step-gap)]",
          "[&:not(:last-child)]:after:transition-all [&:not(:last-child)]:after:duration-200",
        ),
        line: "flex-1 border-t-0 mb-4",
      },
    },
  },
);

const VerticalStep = React.forwardRef<HTMLDivElement, VerticalStepProps>(
  (props, ref) => {
    const stepper = useStepper();

    const opacity = props.hasVisited ? 1 : 0.8;
    const localIsLoading = stepper.isLoading ?? props.state === "loading";
    const localIsError = stepper.isError ?? props.state === "error";

    const isLastStep = props.index === stepper.steps.length - 1;

    const active =
      stepper.variant === "line"
        ? (props.isCompletedStep ?? props.isCurrentStep)
        : props.isCompletedStep;
    const checkIcon = props.checkIcon ?? stepper.checkIcon;
    const errorIcon = props.errorIcon ?? stepper.errorIcon;

    const renderChildren = (): React.ReactNode => {
      if (!stepper.expandVerticalSteps) {
        return (
          <Collapsible open={props.isCurrentStep}>
            <CollapsibleContent
              className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"
              ref={node => {
                if (
                  // If the step is the first step and the previous step
                  // was the last step or if the step is not the first step
                  // This prevents initial scrolling when the stepper
                  // is located anywhere other than the top of the view.
                  stepper.scrollTracking &&
                  ((props.index === 0 &&
                    stepper.previousActiveStep &&
                    stepper.previousActiveStep === stepper.steps.length) ??
                    (props.index && props.index > 0))
                ) {
                  node?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }}
            >
              {props.children}
            </CollapsibleContent>
          </Collapsible>
        );
      }
      return props.children;
    };

    return (
      <div
        className={cn(
          "stepper__vertical-step",
          verticalStepVariants({
            variant: stepper.variant?.includes("circle") ? "circle" : "line",
          }),
          stepper.isLastStep && "gap-[var(--step-gap)]",
          stepper.styles?.["vertical-step"],
        )}
        data-active={active}
        data-clickable={stepper.clickable ?? Boolean(props.onClickStep)}
        data-completed={props.isCompletedStep}
        data-invalid={localIsError}
        data-optional={stepper.steps[props.index ?? 0]?.optional}
        onClick={() =>
          props.onClickStep?.(props.index ?? 0, stepper.setStep) ??
          stepper.onClickStep?.(props.index ?? 0, stepper.setStep)
        }
        onKeyDown={() =>
          props.onClickStep?.(props.index ?? 0, stepper.setStep) ??
          stepper.onClickStep?.(props.index ?? 0, stepper.setStep)
        }
        ref={ref}
        role="button"
        tabIndex={0}
      >
        <div
          className={cn(
            "stepper__vertical-step-container",
            "flex items-center",
            stepper.variant === "line" &&
              "border-s-[3px] data-[active=true]:border-primary py-2 ps-3",
            stepper.styles?.["vertical-step-container"],
          )}
          data-active={active}
          data-vertical
        >
          <StepButtonContainer
            {...{ isLoading: localIsLoading, isError: localIsError, ...props }}
          >
            <StepIcon
              {...{
                index: props.index,
                isError: localIsError,
                isLoading: localIsLoading,
                isCurrentStep: props.isCurrentStep,
                isCompletedStep: props.isCompletedStep,
              }}
              checkIcon={checkIcon}
              errorIcon={errorIcon}
              icon={props.icon}
            />
          </StepButtonContainer>
          <StepLabel
            description={props.description}
            label={props.label}
            {...{ isCurrentStep: props.isCurrentStep, opacity }}
          />
        </div>
        <div
          className={cn(
            "stepper__vertical-step-content",
            !isLastStep && "min-h-4",
            stepper.variant !== "line" && "ps-[--step-icon-size]",
            stepper.variant === "line" &&
              stepper.orientation === "vertical" &&
              "min-h-0",
            stepper.styles?.["vertical-step-content"],
          )}
        >
          {renderChildren()}
        </div>
      </div>
    );
  },
);

VerticalStep.displayName = "VerticalStep";

// <---------- HORIZONTAL STEP ---------->

const HorizontalStep = React.forwardRef<HTMLDivElement, StepSharedProps>(
  (props, ref) => {
    const stepper = useStepper();

    const localIsLoading = stepper.isLoading ?? props.state === "loading";
    const localIsError = stepper.isError ?? props.state === "error";

    const opacity = props.hasVisited ? 1 : 0.8;

    const active =
      stepper.variant === "line"
        ? (props.isCompletedStep ?? props.isCurrentStep)
        : props.isCompletedStep;

    const checkIcon = props.checkIcon ?? stepper.checkIcon;
    const errorIcon = props.errorIcon ?? stepper.errorIcon;

    return (
      <div
        aria-disabled={!props.hasVisited}
        className={cn(
          "stepper__horizontal-step",
          "flex items-center relative transition-all duration-200",
          "[&:not(:last-child)]:flex-1",
          "[&:not(:last-child)]:after:transition-all [&:not(:last-child)]:after:duration-200",
          "[&:not(:last-child)]:after:content-[''] [&:not(:last-child)]:after:h-[2px] [&:not(:last-child)]:after:bg-border",
          "data-[completed=true]:[&:not(:last-child)]:after:bg-primary",
          "data-[invalid=true]:[&:not(:last-child)]:after:bg-destructive",
          stepper.variant === "circle-alt" &&
            "justify-start flex-col flex-1 [&:not(:last-child)]:after:relative [&:not(:last-child)]:after:order-[-1] [&:not(:last-child)]:after:start-[50%] [&:not(:last-child)]:after:end-[50%] [&:not(:last-child)]:after:top-[calc(var(--step-icon-size)/2)] [&:not(:last-child)]:after:w-[calc((100%-var(--step-icon-size))-(var(--step-gap)))]",
          stepper.variant === "circle" &&
            "[&:not(:last-child)]:after:flex-1 [&:not(:last-child)]:after:ms-[var(--step-gap)] [&:not(:last-child)]:after:me-[var(--step-gap)]",
          stepper.variant === "line" &&
            "flex-col flex-1 border-t-[3px] data-[active=true]:border-primary",
          stepper.styles?.["horizontal-step"],
        )}
        data-active={active}
        data-clickable={stepper.clickable}
        data-completed={props.isCompletedStep}
        data-invalid={localIsError}
        data-optional={stepper.steps[props.index ?? 0]?.optional}
        onClick={() => stepper.onClickStep?.(props.index ?? 0, stepper.setStep)}
        onKeyDown={() =>
          stepper.onClickStep?.(props.index ?? 0, stepper.setStep)
        }
        ref={ref}
        role="button"
        tabIndex={0}
      >
        <div
          className={cn(
            "stepper__horizontal-step-container",
            "flex items-center",
            stepper.variant === "circle-alt" && "flex-col justify-center gap-1",
            stepper.variant === "line" && "w-full",
            stepper.styles?.["horizontal-step-container"],
          )}
        >
          <StepButtonContainer
            {...{ ...props, isError: localIsError, isLoading: localIsLoading }}
          >
            <StepIcon
              {...{
                index: props.index,
                isCompletedStep: props.isCompletedStep,
                isCurrentStep: props.isCurrentStep,
                isError: localIsError,
                isKeepError: props.isKeepError,
                isLoading: localIsLoading,
              }}
              checkIcon={checkIcon}
              errorIcon={errorIcon}
              icon={props.icon}
            />
          </StepButtonContainer>
          <StepLabel
            description={props.description}
            label={props.label}
            {...{ isCurrentStep: props.isCurrentStep, opacity }}
          />
        </div>
      </div>
    );
  },
);

HorizontalStep.displayName = "HorizontalStep";

// <---------- STEP BUTTON CONTAINER ---------->

type StepButtonContainerProps = StepSharedProps & React.PropsWithChildren;

function StepButtonContainer({
  isCurrentStep,
  isCompletedStep,
  children,
  isError,
  isLoading: isLoadingProp,
  onClickStep,
}: StepButtonContainerProps): JSX.Element | null {
  const stepper = useStepper();

  const currentStepClickable = stepper.clickable ?? Boolean(onClickStep);

  const isLoading = isLoadingProp ?? stepper.isLoading;

  if (stepper.variant === "line") {
    return null;
  }

  return (
    <Button
      aria-current={isCurrentStep ? "step" : undefined}
      className={cn(
        "stepper__step-button-container",
        "rounded-full p-0 pointer-events-none",
        "w-[var(--step-icon-size)] h-[var(--step-icon-size)]",
        "border-2 flex rounded-full justify-center items-center",
        "data-[clickable=true]:pointer-events-auto",
        "data-[active=true]:bg-primary data-[active=true]:border-primary data-[active=true]:text-primary-foreground",
        "data-[current=true]:border-primary data-[current=true]:bg-secondary",
        "data-[invalid=true]:bg-destructive data-[invalid=true]:border-destructive data-[invalid=true]:text-destructive-foreground",
        stepper.styles?.["step-button-container"],
      )}
      data-active={isCompletedStep}
      data-clickable={currentStepClickable}
      data-current={isCurrentStep}
      data-invalid={isError ? (isCurrentStep ?? isCompletedStep) : null}
      data-loading={isLoading ? (isCurrentStep ?? isCompletedStep) : null}
      tabIndex={currentStepClickable ? 0 : -1}
      variant="ghost"
    >
      {children}
    </Button>
  );
}

// <---------- STEP ICON ---------->

type IconType = LucideIcon | React.ComponentType | undefined;

const iconVariants = cva("", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-4",
      lg: "size-5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface StepIconProps {
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isKeepError?: boolean;
  icon?: IconType;
  index?: number;
  checkIcon?: IconType;
  errorIcon?: IconType;
}

const StepIcon = React.forwardRef<HTMLDivElement, StepIconProps>(
  (props, ref) => {
    const { size } = useStepper();

    const Icon = React.useMemo(() => props.icon ?? null, [props.icon]);

    const ErrorIcon = React.useMemo(
      () => props.errorIcon ?? null,
      [props.errorIcon],
    );

    const Check = React.useMemo(
      () => props.checkIcon ?? CheckIcon,
      [props.checkIcon],
    );

    return React.useMemo(() => {
      if (props.isCompletedStep) {
        if (props.isError && props.isKeepError) {
          return (
            <div key="icon">
              <X className={cn(iconVariants({ size }))} />
            </div>
          );
        }
        return (
          <div key="check-icon">
            <Check className={cn(iconVariants({ size }))} />
          </div>
        );
      }
      if (props.isCurrentStep) {
        if (props.isError && ErrorIcon) {
          return (
            <div key="error-icon">
              <ErrorIcon className={cn(iconVariants({ size }))} />
            </div>
          );
        }
        if (props.isError) {
          return (
            <div key="icon">
              <X className={cn(iconVariants({ size }))} />
            </div>
          );
        }
        if (props.isLoading) {
          return (
            <Loader2 className={cn(iconVariants({ size }), "animate-spin")} />
          );
        }
      }
      if (Icon) {
        return (
          <div key="step-icon">
            <Icon className={cn(iconVariants({ size }))} />
          </div>
        );
      }
      return (
        <span
          className={cn("font-medium text-center text-md")}
          key="label"
          ref={ref}
        >
          {(props.index ?? 0) + 1}
        </span>
      );
    }, [
      props.isCompletedStep,
      props.isCurrentStep,
      props.isError,
      props.isLoading,
      Icon,
      props.index,
      Check,
      ErrorIcon,
      props.isKeepError,
      ref,
      size,
    ]);
  },
);

StepIcon.displayName = "StepIcon";

// <---------- STEP LABEL ---------->

interface StepLabelProps {
  isCurrentStep?: boolean;
  opacity: number;
  label?: string | React.ReactNode;
  description?: string | null;
}

const labelVariants = cva("", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const descriptionVariants = cva("", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-xs",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

function StepLabel({
  isCurrentStep,
  opacity,
  label,
  description,
}: StepLabelProps): JSX.Element | null {
  const { variant, styles, size, orientation } = useStepper();
  const shouldRender = Boolean(label) || Boolean(description);

  return shouldRender ? (
    <div
      aria-current={isCurrentStep ? "step" : undefined}
      className={cn(
        "stepper__step-label-container",
        "flex-col flex",
        variant !== "line" ? "ms-2" : orientation === "horizontal" && "my-2",
        variant === "circle-alt" && "text-center",
        variant === "circle-alt" && orientation === "horizontal" && "ms-0",
        variant === "circle-alt" && orientation === "vertical" && "text-start",
        styles?.["step-label-container"],
      )}
      style={{
        opacity,
      }}
    >
      {Boolean(label) && (
        <span
          className={cn(
            "stepper__step-label",
            labelVariants({ size }),
            styles?.["step-label"],
          )}
        >
          {label}
        </span>
      )}
      {Boolean(description) && (
        <span
          className={cn(
            "stepper__step-description",
            "text-muted-foreground",
            descriptionVariants({ size }),
            styles?.["step-description"],
          )}
        >
          {description}
        </span>
      )}
    </div>
  ) : null;
}

export { Stepper, Step, useStepper };
export type { StepProps, StepperProps, StepItem };
