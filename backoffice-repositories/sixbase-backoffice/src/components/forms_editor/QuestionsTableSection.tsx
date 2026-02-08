import DragDropTable from '../DragDropTable';
import SortableQuestionRow from '../SortableQuestionRow';
import { type QuestionsTableSectionProps } from '../../interfaces/formseditor.interface';

export const QuestionsTableSection = ({
  questions,
  onReorder,
  onUpdate,
  onSave,
  onMove,
  onDuplicate,
  onRemove,
}: QuestionsTableSectionProps) => (
  <div style={{ width: '100%', overflowX: 'auto' }}>
    <DragDropTable
      items={questions}
      getItemId={(question) => String(question.id)}
      onReorder={onReorder}
      renderItem={(question) => {
        const index = questions.findIndex((q) => q.id === question.id);
        return (
          <SortableQuestionRow
            key={question.id}
            question={question}
            index={index}
            steps={[]}
            onChange={onUpdate}
            onSave={onSave}
            onMoveUp={() => onMove(index, -1)}
            onMoveDown={() => onMove(index, 1)}
            onDuplicate={() => onDuplicate(index)}
            onRemove={() => onRemove(index)}
          />
        );
      }}
    >
      <thead>
        <tr>
          <th style={{ width: 40, minWidth: 40 }}></th>
          <th style={{ width: 50, minWidth: 50 }}>#</th>
          <th style={{ minWidth: 200 }}>Pergunta</th>
          <th style={{ width: 180, minWidth: 150 }}>Tipo</th>
          <th style={{ width: 100, minWidth: 80 }}>Opções</th>
          <th
            style={{
              width: 120,
              minWidth: 100,
              textAlign: 'right',
            }}
          >
            Ações
          </th>
        </tr>
      </thead>
    </DragDropTable>
  </div>
);

export default QuestionsTableSection;
