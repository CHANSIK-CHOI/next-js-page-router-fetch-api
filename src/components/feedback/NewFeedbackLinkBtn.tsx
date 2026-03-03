import React from "react";
import { Button, useAlert } from "@/components/ui";
import { pushSafely } from "@/lib/navigation/client";
import { useRouter } from "next/router";
import { useSession } from "@/components/session";

export default function NewFeedbackLinkBtn() {
  const router = useRouter();
  const { openAlert } = useAlert();
  const { session } = useSession();

  const handleClickNewFeedback = () => {
    if (!session?.access_token) {
      openAlert({
        description: "피드백을 남기기 위해서는 로그인을 해야합니다.",
        onOk: () => {
          void pushSafely(router, "/login?next=/feedback/new");
        },
      });
      return;
    }

    void pushSafely(router, "/feedback/new");
  };
  return (
    <Button variant="outline" onClick={handleClickNewFeedback}>
      피드백 남기기
    </Button>
  );
}
