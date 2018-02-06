import React from "react";
import { Icon, SemanticICONS, Step, StepGroupProps } from "semantic-ui-react";

export interface IStepsProperties extends Pick<StepGroupProps, "attached"> {
    step: number;
    steps: IStepInfo[];
}

export interface IStepInfo {
    icon: SemanticICONS;
    title: string;
    description?: string;
}

enum StepStatus {
    prev, current, post,
}

export class Steps extends React.Component<IStepsProperties> {
    private renderStep(info: IStepInfo, idx: number) {
        const status = this.stepStatusFromIdx(idx);
        return <Step completed={status === StepStatus.prev} active={status === StepStatus.current} key={idx}>
            <Icon name={info.icon} />
            <Step.Content>
                <Step.Title>{info.title}</Step.Title>
                {info.description && <Step.Description>{info.description}</Step.Description>}
            </Step.Content>
        </Step>;
    }

    private stepStatusFromIdx(idx: number) {
        if (this.props.step === idx) {
            return StepStatus.current;
        }
        if (this.props.step < idx) {
            return StepStatus.post;
        }
        return StepStatus.prev;
    }

    public render() {
        return <Step.Group attached={this.props.attached}>{
            this.props.steps.map((step, idx) => this.renderStep(step, idx))
        }</Step.Group>;
    }
}
