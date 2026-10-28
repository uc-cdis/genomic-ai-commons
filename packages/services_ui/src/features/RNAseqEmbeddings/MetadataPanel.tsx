import React, {useMemo} from "react";
import MetadataTable from "./MetadataTable";
import {useMetadata} from "./core/MetadataContext";

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
  const {metadata} = useMetadata()


  const columns = useMemo(() => {
    if( metadata.length > 0) {
      return Object.keys(metadata[0])
    } else return DEFAULT_COLUMNS
  }, [metadata]);

  const rows = useMemo(() => metadata ?? [], [metadata])

  return <MetadataTable columns={columns} rows={rows} />;
};

export default MetadataPanel;
