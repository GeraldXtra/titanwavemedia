import Link from "next/link";
import NewProjectForm from "@/components/console/NewProjectForm";
import { clientContext } from "@/lib/console";
import copy from "@/content/console/new-project";

export const metadata = { title: copy.meta.title };

export default async function NewProjectPage() {
  await clientContext();
  return (
    <>
      <div className="c-head">
        <div>
          <p className="c-head__crumb">
            <Link className="link" href="/console/projects">
              {copy.crumb}
            </Link>
          </p>
          <h1>{copy.title}</h1>
          <p className="c-lede">{copy.lede}</p>
        </div>
      </div>
      <NewProjectForm />
    </>
  );
}
