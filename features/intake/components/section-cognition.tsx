"use client";

import type { CognitionData } from "@/types/intake";
import {
  FieldGroup,
  YesNoUnknownField,
  YesNoField,
  TextField,
  TextareaField,
} from "./fields";

type Props = {
  value: CognitionData;
  onChange: (v: CognitionData) => void;
};

function set<K extends keyof CognitionData>(
  prev: CognitionData,
  key: K,
  val: CognitionData[K],
): CognitionData {
  return { ...prev, [key]: val };
}

export function SectionCognition({ value, onChange }: Props) {
  const s = value;
  const u = <K extends keyof CognitionData>(k: K, v: CognitionData[K]) => onChange(set(s, k, v));

  return (
    <div className="space-y-8">
      <FieldGroup legend="Orientation">
        <YesNoField
          label="Oriented to person"
          value={s.oriented_to_person}
          onChange={(v) => u("oriented_to_person", v)}
        />
        <YesNoField
          label="Oriented to place"
          value={s.oriented_to_place}
          onChange={(v) => u("oriented_to_place", v)}
        />
        <YesNoField
          label="Oriented to time"
          value={s.oriented_to_time}
          onChange={(v) => u("oriented_to_time", v)}
        />
      </FieldGroup>

      <FieldGroup legend="Memory">
        <YesNoUnknownField
          label="Short-term memory concern"
          value={s.short_term_memory_concern}
          onChange={(v) => u("short_term_memory_concern", v)}
        />
        <YesNoUnknownField
          label="Long-term memory concern"
          value={s.long_term_memory_concern}
          onChange={(v) => u("long_term_memory_concern", v)}
        />
        <YesNoField
          label="Forgets medications"
          value={s.forgets_medications}
          onChange={(v) => u("forgets_medications", v)}
        />
        <YesNoField
          label="Gets lost in familiar places"
          value={s.gets_lost_in_familiar_places}
          onChange={(v) => u("gets_lost_in_familiar_places", v)}
        />
      </FieldGroup>

      <FieldGroup legend="Executive Function">
        <YesNoUnknownField
          label="Executive function concerns"
          value={s.executive_function_concerns}
          onChange={(v) => u("executive_function_concerns", v)}
        />
        <YesNoField
          label="Problem-solving difficulty"
          value={s.problem_solving_difficulty}
          onChange={(v) => u("problem_solving_difficulty", v)}
        />
        <YesNoField
          label="Task sequencing difficulty"
          value={s.task_sequencing_difficulty}
          onChange={(v) => u("task_sequencing_difficulty", v)}
        />
      </FieldGroup>

      <FieldGroup legend="Communication &amp; Sensory">
        <YesNoUnknownField
          label="Communication difficulty"
          value={s.communication_difficulty}
          onChange={(v) => u("communication_difficulty", v)}
        />
        <YesNoUnknownField
          label="Hearing impairment"
          value={s.hearing_impairment}
          onChange={(v) => u("hearing_impairment", v)}
        />
        <YesNoUnknownField
          label="Vision impairment"
          value={s.vision_impairment}
          onChange={(v) => u("vision_impairment", v)}
        />
      </FieldGroup>

      <FieldGroup legend="Emergency Preparedness">
        <YesNoField
          label="Knows emergency plan"
          value={s.knows_emergency_plan}
          onChange={(v) => u("knows_emergency_plan", v)}
        />
        <YesNoField
          label="Can call for help independently"
          value={s.can_call_for_help_independently}
          onChange={(v) => u("can_call_for_help_independently", v)}
        />
        <YesNoField
          label="Medical alert device present"
          value={s.medical_alert_device_present}
          onChange={(v) => u("medical_alert_device_present", v)}
        />
      </FieldGroup>

      <FieldGroup legend="Medication Safety">
        <YesNoUnknownField
          label="Manages medications independently"
          value={s.manages_medications_independently}
          onChange={(v) => u("manages_medications_independently", v)}
        />
        <YesNoField
          label="Medication errors reported"
          value={s.medication_errors_reported}
          onChange={(v) => u("medication_errors_reported", v)}
        />
        <YesNoField
          label="Pill organizer used"
          value={s.pill_organizer_used}
          onChange={(v) => u("pill_organizer_used", v)}
        />
      </FieldGroup>

      <FieldGroup legend="Diagnosis">
        <YesNoField
          label="Dementia diagnosis"
          value={s.dementia_diagnosis}
          onChange={(v) => u("dementia_diagnosis", v)}
        />
        {s.dementia_diagnosis && (
          <TextField
            label="Dementia type"
            value={s.dementia_type}
            onChange={(v) => u("dementia_type", v)}
            placeholder="e.g. Alzheimer's, Lewy body, vascular"
          />
        )}
      </FieldGroup>

      <TextareaField
        label="Clinician Notes"
        value={s.notes}
        onChange={(v) => u("notes", v)}
        placeholder="Additional observations about cognition, safety, and medication management…"
      />
    </div>
  );
}
