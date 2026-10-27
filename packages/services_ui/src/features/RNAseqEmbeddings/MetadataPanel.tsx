import React from "react";
import MetadataTable from "./MetadataTable";

const DEFAULT_COLUMNS = [
  "file_name",
  "case_id",
  "sample_ids",
  "project_id",
  "primary_site",
  "disease_type",
  "primary_diagnosis",
  "ann_arbor_clinical_stage",
  // "age_in_years",
  // "sex_at_birth",
  // "race",
  "ethnicity",
  "vital_status",
];

const MetadataPanel = () => {
  const currentFile = null;

  return <MetadataTable columns={DEFAULT_COLUMNS} rows={currentFile ?? []} />;
};

export default MetadataPanel;
