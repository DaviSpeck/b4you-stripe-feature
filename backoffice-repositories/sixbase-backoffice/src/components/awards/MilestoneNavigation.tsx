import { FC } from 'react';
import { Button } from 'reactstrap';
import { MilestoneNavigationProps } from '../../interfaces/awards.interface';

const MilestoneNavigation: FC<MilestoneNavigationProps> = ({
  milestones,
  selectedMilestone,
  onMilestoneChange,
}) => {
  return (
    <div className="mb-4">
      <div className="d-flex gap-2 flex-wrap">
        {milestones.map((milestone) => (
          <Button
            key={milestone}
            color={selectedMilestone === milestone ? 'primary' : 'secondary'}
            outline={selectedMilestone !== milestone}
            onClick={() => onMilestoneChange(milestone)}
            className="px-3"
          >
            {milestone}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MilestoneNavigation;
