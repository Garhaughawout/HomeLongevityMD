"use client";

import type { MobilityData } from "@/types/intake";
import {
  FieldGroup,
  YesNoUnknownField,
  YesNoField,
  AssistanceLevelField,
  SelectField,
  NumberField,
  TextField,
  TextareaField,
} from "./fields";

type Props = {
  value: MobilityData;
  onChange: (v: MobilityData) => void;
};

function set<K extends keyof MobilityData>(
  prev: MobilityData,
  key: K,
  val: MobilityData[K],
): MobilityData {
  return { ...prev, [key]: val };
}

export function SectionMobility({ value, onChange }: Props) {
  const s = value;
  const u = <K extends keyof MobilityData>(k: K, v: MobilityData[K]) => onChange(set(s, k, v));

  return (
    <div className="space-y-8">
      <FieldGroup legend="Transfers">
        <YesNoUnknownField
          label="Transfers independently"
          value={s.transfer_independence}
          onChange={(v) => u("transfer_independence", v)}
        />
        <AssistanceLevelField
          label="Transfer assist level"
          value={s.transfer_assist_level}
          onChange={(v) => u("transfer_assist_level", v)}
        />
        <TextField
          label="Transfer surfaces managed"
          value={s.transfer_surfaces_managed}
          onChange={(v) => u("transfer_surfaces_managed", v)}
          placeholder="e.g. bed, chair, toilet"
          hint="List surfaces the client can transfer to/from"
        />
      </FieldGroup>

      <FieldGroup legend="Ambulation">
        <YesNoUnknownField
          label="Ambulates independently"
          value={s.ambulates_independently}
          onChange={(v) => u("ambulates_independently", v)}
        />
        <YesNoField
          label="Uses mobility aid"
          value={s.uses_mobility_aid}
          onChange={(v) => u("uses_mobility_aid", v)}
        />
        <SelectField
          label="Mobility aid type"
          value={s.mobility_aid_type}
          onChange={(v) => u("mobility_aid_type", v)}
          options={[
            { value: "none", label: "None" },
            { value: "cane", label: "Cane" },
            { value: "walker", label: "Walker" },
            { value: "rollator", label: "Rollator" },
            { value: "wheelchair", label: "Wheelchair" },
            { value: "scooter", label: "Scooter" },
            { value: "other", label: "Other" },
          ]}
        />
        {s.mobility_aid_type === "other" && (
          <TextField
            label="Describe mobility aid"
            value={s.mobility_aid_other}
            onChange={(v) => u("mobility_aid_other", v)}
          />
        )}
      </FieldGroup>

      <FieldGroup legend="Gait">
        <YesNoField
          label="Gait concerns observed"
          value={s.gait_concerns_observed}
          onChange={(v) => u("gait_concerns_observed", v)}
        />
        {s.gait_concerns_observed && (
          <TextField
            label="Describe gait concern"
            value={s.gait_concern_description}
            onChange={(v) => u("gait_concern_description", v)}
            placeholder="e.g. antalgic, shuffling, ataxic"
          />
        )}
      </FieldGroup>

      <FieldGroup legend="Stairs">
        <YesNoUnknownField
          label="Able to climb stairs"
          value={s.able_to_climb_stairs}
          onChange={(v) => u("able_to_climb_stairs", v)}
        />
        <YesNoField
          label="Stair rail present"
          value={s.stair_rail_present}
          onChange={(v) => u("stair_rail_present", v)}
        />
      </FieldGroup>

      <FieldGroup legend="Timed Mobility Tests">
        <YesNoField
          label="TUG test performed"
          value={s.tug_test_performed}
          onChange={(v) => u("tug_test_performed", v)}
        />
        {s.tug_test_performed && (
          <NumberField
            label="TUG test result"
            value={s.tug_test_seconds}
            onChange={(v) => u("tug_test_seconds", v)}
            min={0}
            step={0.1}
            unit="sec"
            hint="<12 s = low risk · >20 s = high fall risk"
          />
        )}
        <YesNoField
          label="5× Sit-to-Stand performed"
          value={s.five_times_sit_to_stand_performed}
          onChange={(v) => u("five_times_sit_to_stand_performed", v)}
        />
        {s.five_times_sit_to_stand_performed && (
          <NumberField
            label="5× Sit-to-Stand result"
            value={s.five_times_sit_to_stand_seconds}
            onChange={(v) => u("five_times_sit_to_stand_seconds", v)}
            min={0}
            step={0.1}
            unit="sec"
            hint="<12 s = normal"
          />
        )}
      </FieldGroup>

      <TextareaField
        label="Clinician Notes"
        value={s.notes}
        onChange={(v) => u("notes", v)}
        placeholder="Additional observations about mobility and functional performance…"
      />
    </div>
  );
}
