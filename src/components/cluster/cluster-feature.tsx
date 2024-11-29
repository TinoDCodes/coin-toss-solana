"use client";

import { useState } from "react";
import { ClusterUiModal } from "./cluster-ui";
import { ClusterUiTable } from "./cluster-ui";
import { AppHero } from "@/components/AppLayout";

export default function ClusterFeature() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <AppHero
        title="Clusters"
        subtitle="Manage and select your Solana clusters"
      >
        <ClusterUiModal
          show={showModal}
          hideModal={() => setShowModal(false)}
        />
        <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add Cluster
        </button>
      </AppHero>
      <ClusterUiTable />
    </div>
  );
}
