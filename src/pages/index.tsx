import Head from "next/head";
import { faker } from "@faker-js/faker";
import { useMemo, useState } from "react";
import { createComponent } from "~/components/ui";
import { tv } from "tailwind-variants";
import { useForm } from "react-hook-form";
const projects = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  name: faker.animal.bird(),
}));

const Input = createComponent(
  "input",
  tv({ base: "rounded border px-2 py-1 w-full" }),
);

export default function Home() {
  const [selected, setSelected] = useState({});

  const form = useForm({
    defaultValues: {
      amount: 50,
      distribution: "equal",
    },
    mode: "onChange",
  });
  const projectById = useMemo(
    () => projects.reduce((acc, x) => ({ ...acc, [x.id]: x }), {}),
    [selected, projects],
  );

  console.log(form.watch());

  const totalAmount = form.watch("amount") ?? 0;
  const distributionMethod = form.watch("distribution");

  console.log({ distributionMethod });
  const distribution = distributionCalculations[distributionMethod](
    totalAmount,
    Object.values(selected).filter(Boolean).length,
  );
  console.log(
    "distribution",
    distributionMethod,
    distribution,
    totalAmount,
    Object.values(selected).filter(Boolean).length,
  );

  const total = distribution.reduce((sum, x) => sum + x, 0);
  return (
    <>
      <main className="container mx-auto max-w-sm py-16 font-sans">
        <form
          className="grid gap-4 divide-y"
          onSubmit={form.handleSubmit((values) => {
            console.log(values);
          })}
        >
          <div className="flex gap-1">
            <span>I have </span>
            <div className="flex">
              <span>$</span>
              <input
                className={"w-16 bg-gray-100 px-2"}
                type="number"
                defaultValue={"50"}
                {...form.register("amount")}
              />
            </div>
            to donate
          </div>
          <div className="pt-4">
            <div>I want to donate to these projects:</div>
            <div className="grid grid-cols-3 gap-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() =>
                    setSelected((s) => ({ ...s, [project.id]: !s[project.id] }))
                  }
                  className="cursor-pointer rounded bg-gray-100 p-2 hover:bg-gray-200"
                >
                  <input type="checkbox" checked={selected[project.id]} />
                  <h3>{project.name}</h3>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-1 pt-4">
            <div className="">Following a </div>
            <select {...form.register("distribution")}>
              <option value="equal">equal</option>
              <option value="linear">linear</option>
              <option value="custom">custom</option>
            </select>
            <div>distribution</div>
          </div>
          <table className="w-full table-fixed">
            <tbody>
              {Object.keys(selected)
                .filter((s) => selected[s])
                .map((id, index) => {
                  const amount = distribution[index] ?? 0;

                  console.log({ amount });
                  return (
                    <tr key={id} className="">
                      <td className="">
                        <h5 className="flex-1 text-sm">
                          {projectById[id]?.name}
                        </h5>
                      </td>
                      <td className="">
                        <Input
                          className=""
                          name={`allocation.${id}`}
                          value={amount}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div className="flex pt-4 font-bold">
            <div className="flex-1">Total</div>
            <div>{total}</div>
          </div>
          <button
            type="submit"
            className="w-full rounded bg-emerald-300 px-2 py-1"
          >
            Donate
          </button>
        </form>
      </main>
    </>
  );
}

const distributionCalculations: Record<
  string,
  (amount: number, count: number) => number[]
> = {
  custom: (total, count) => Array.from({ length: count }, () => 0),
  equal: (total, count) => Array.from({ length: count }, () => total / count),
  linear: (total, count) => {
    const sumOfNaturalNumbers = (count * (count + 1)) / 2;

    // Determine the amount each decrement step represents
    const decrementStep = total / sumOfNaturalNumbers;

    // Calculate the distribution
    const distribution = [];
    for (let i = count; i > 0; i--) {
      // The amount for each item is its position (i) in the
      // sequence multiplied by the decrement step
      distribution.push(i * decrementStep);
    }

    return distribution;

    // const increment = total / count;

    // Calculate values
    // return Array.from({ length: count }, (_, i) => (i + 1) * increment);

    return Array.from({ length: count }, (_, i) => total / 2 ** i);
  },
};
