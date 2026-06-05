import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  Truck,
  Edit,
  Plus,
  Camera,
  ClipboardCheck,
  FileText,
  Wrench,
  History,
  Copy,
  Save,
  ScanLine,
  LogIn,
  Upload,
  X,
} from "lucide-react";
import clsx from "clsx";
import { DetailPageShell, MetaPair } from "@/components/shop/DetailPageShell";
import { PageShell } from "@/components/shop/PageShell";
import { EmptyState } from "@/components/shop/EmptyState";
import { StatusBadge } from "@/components/shop/StatusBadge";
import { MoneyCell, DateCell } from "@/components/shop/cells";
import { vehicles } from "@/data/vehicles";
import { customers } from "@/data/customers";
import { estimates } from "@/data/estimates";
import { inspections } from "@/data/inspections";
import { useShopState } from "@/lib/shop-store";
import { useModals } from "@/components/ui/ModalProvider";
import { usd } from "@/lib/format";

export const Route = createFileRoute("/vehicles/$id")({
  component: VehicleDetail,
});

type Tab =
  | "overview"
  | "service-history"
  | "inspections"
  | "estimates"
  | "parts"
  | "photos"
  | "notes";

function VehicleDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState(false);
  const { repairOrders } = useShopState();
  const { open: openModal } = useModals();

  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) {
    return (
      <PageShell title="Vehicle not found">
        <EmptyState icon={Truck} title="Vehicle not found" description={`No vehicle with ID ${id}.`} />
      </PageShell>
    );
  }

  const customer = customers.find((c) => c.id === vehicle.customerId);
  const vehROs = repairOrders.filter((r) => r.vehicleId === vehicle.id);
  const vehEstimates = estimates.filter((e) => e.vehicleId === vehicle.id);
  const vehInspections = inspections.filter((ins) =>
    vehROs.some((r) => r.id === ins.repairOrderId),
  );

  const openRO = vehROs.find((r) => r.status !== "completed" && r.status !== "ready");
  const ltSpend = vehROs.reduce((acc, r) => acc + r.total, 0);

  // --- Header action handlers ---
  const handleEdit = () => {
    toast.info("Edit vehicle", { description: "Inline edit - coming soon" });
    setEditing(true);
  };

  const handleCopyVin = async () => {
    try {
      await navigator.clipboard.writeText(vehicle.vin);
      toast.success("VIN copied to clipboard");
    } catch {
      toast.success("VIN copied to clipboard");
    }
  };

  const handleAddPhoto = () => {
    toast.success("Photo uploaded", {
      description: `vehicle_photo_${Date.now()}.jpg`,
    });
    setTab("photos");
  };

  const handleStartInspection = () => {
    navigate({ to: "/inspections" });
    toast.success("New inspection started");
  };

  const handleRescanVin = () => {
    toast.info("Re-scanning VIN…");
    setTimeout(() => {
      toast.success("VIN re-confirmed: " + vehicle.vin);
    }, 800);
  };

  const handleCheckIn = () => {
    toast.success("Vehicle checked in", { description: "Assigned to Bay 3" });
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "service-history", label: "Service History", count: vehROs.length },
    { id: "inspections", label: "Inspections", count: vehInspections.length },
    { id: "estimates", label: "Estimates", count: vehEstimates.length },
    { id: "parts", label: "Parts" },
    { id: "photos", label: "Photos" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <>
    <DetailPageShell
      backTo="/vehicles"
      backLabel="All vehicles"
      eyebrow={`${vehicle.year} ${vehicle.make.toUpperCase()} ${vehicle.model.toUpperCase()}`}
      title={vehicle.unit}
      titleMeta={
        <div className="flex flex-wrap items-center gap-2">
          {vehicle.isFrankenstein && <StatusBadge status="frankenstein" size="md" />}
          {openRO && (
            <Link
              to="/repair-orders/$id"
              params={{ id: openRO.id }}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground"
            >
              In Shop · RO #{openRO.id}
            </Link>
          )}
          {customer?.fleetPlatform && (
            <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold text-[#991B1B]">
              {customer.fleetPlatform}
            </span>
          )}
        </div>
      }
      headerRight={
        <div className="grid grid-cols-2 gap-4 text-right">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {vehicle.hours !== undefined ? "Hours" : "Mileage"}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {vehicle.hours !== undefined
                ? vehicle.hours.toLocaleString()
                : (vehicle.mileage ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {vehicle.hours !== undefined ? "hrs" : "mi"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Lifetime Service
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">
              {usd.format(ltSpend)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {vehROs.length} {vehROs.length === 1 ? "visit" : "visits"}
            </div>
          </div>
        </div>
      }
      actions={
        <>
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Edit className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={handleCopyVin}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Copy className="h-3 w-3" />
            Copy VIN
          </button>
          <button
            type="button"
            onClick={handleRescanVin}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <ScanLine className="h-3 w-3" />
            Re-scan VIN
          </button>
          <button
            type="button"
            onClick={handleAddPhoto}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
          >
            <Camera className="h-3 w-3" />
            Add Photo
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartInspection}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
            >
              <ClipboardCheck className="h-3 w-3" />
              Start Inspection
            </button>
            <button
              type="button"
              onClick={handleCheckIn}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
            >
              <LogIn className="h-3 w-3" />
              Check In
            </button>
            <button
              onClick={() =>
                openModal("new-ro", {
                  customerId: vehicle.customerId,
                  vehicleId: vehicle.id,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-[11px] font-semibold text-brand-green-foreground hover:opacity-90"
            >
              <Plus className="h-3 w-3" />
              New RO
            </button>
          </div>
        </>
      }
      metaRow={
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <MetaPair
            label="Owner"
            value={
              customer ? (
                <Link
                  to="/customers/$id"
                  params={{ id: customer.id }}
                  className="hover:underline"
                >
                  {customer.name}
                </Link>
              ) : (
                "-"
              )
            }
          />
          <MetaPair
            label="VIN"
            value={<span className="font-mono text-[10px]">{vehicle.vin}</span>}
          />
          <MetaPair label="License Plate" value={vehicle.licensePlate} />
          <MetaPair
            label="Last Service"
            value={format(parseISO(vehicle.lastService), "MMM d, yyyy")}
          />
          <MetaPair label="Type" value={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
        </div>
      }
      tabs={tabs}
      activeTabId={tab}
      onTabChange={(id) => setTab(id as Tab)}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          {tab === "overview" && (
            <OverviewTab vehicle={vehicle} ros={vehROs.slice(0, 5)} inspections={vehInspections.slice(0, 3)} />
          )}
          {tab === "service-history" && (
            <ServiceHistoryTab
              ros={vehROs}
              onRowClick={(rowId) =>
                navigate({ to: "/repair-orders/$id", params: { id: rowId } })
              }
            />
          )}
          {tab === "inspections" && <InspectionsListTab inspections={vehInspections} />}
          {tab === "estimates" && <EstimatesListTab estimates={vehEstimates} />}
          {tab === "parts" && (
            <EmptyState
              icon={Wrench}
              title="No parts history"
              description="Parts used on this vehicle will show here once posted to ROs."
            />
          )}
          {tab === "photos" && <PhotosTab vin={vehicle.vin} />}
          {tab === "notes" && <NotesTab note={vehicle.serviceNotes} />}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          {/* Vehicle photo placeholder */}
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <div className="flex h-40 items-center justify-center bg-surface">
              <Truck className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div className="p-3 text-center">
              <button
                type="button"
                onClick={handleAddPhoto}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <Camera className="h-3 w-3" />
                Add photo
              </button>
            </div>
          </div>

          {/* Recommended services */}
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Recommended Services
            </h3>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Based on last visit + manufacturer guidelines
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              {(
                [
                  { name: "Coolant flush", meta: "DUE", desc: "Every 30k mi or 24 months", due: true },
                  { name: "Brake fluid flush", meta: "In 2k mi", desc: undefined, due: false },
                  { name: "Tire rotation", meta: "In 4k mi", desc: undefined, due: false },
                ] as const
              ).map((service) => (
                <li
                  key={service.name}
                  className={clsx(
                    "rounded-md p-2",
                    service.due
                      ? "border border-accent/40 bg-accent/10"
                      : "border border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{service.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "text-[10px]",
                          service.due
                            ? "font-semibold text-[#991B1B]"
                            : "text-muted-foreground",
                        )}
                      >
                        {service.meta}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigate({ to: "/schedule" });
                          toast.success("Service scheduled", {
                            description: `${service.name} for ${vehicle.make}`,
                          });
                        }}
                        className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold hover:bg-surface"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                  {service.desc && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {service.desc}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Service notes */}
          {vehicle.serviceNotes && (
            <div className="rounded-lg border border-border bg-background p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Service Notes
              </h3>
              <p className="mt-2 text-[11px] italic text-muted-foreground">
                {vehicle.serviceNotes}
              </p>
            </div>
          )}
        </aside>
      </div>
    </DetailPageShell>

    {editing && (
      <EditVehicleModal
        vehicle={vehicle}
        onClose={() => setEditing(false)}
      />
    )}
    </>
  );
}

function EditVehicleModal({
  vehicle,
  onClose,
}: {
  vehicle: NonNullable<ReturnType<typeof vehicles.find>>;
  onClose: () => void;
}) {
  const [vin, setVin] = useState(vehicle.vin);
  const [plate, setPlate] = useState(vehicle.licensePlate);
  const [year, setYear] = useState<number | "">(vehicle.year);
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);

  const handleSave = () => {
    toast.success("Vehicle updated", {
      description: `${year} ${make} ${model} - ${vin}`,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold">Edit Vehicle</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {vehicle.unit}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              VIN
            </label>
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase().slice(0, 17))}
              maxLength={17}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm uppercase tracking-wider focus:border-foreground/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              License Plate
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm uppercase focus:border-foreground/40 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus:border-foreground/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Make
              </label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Model
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface/30 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-foreground hover:opacity-90"
          >
            <Save className="h-3 w-3" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// Tab panels
// ====================================================================
function OverviewTab({
  vehicle,
  ros,
  inspections,
}: {
  vehicle: NonNullable<ReturnType<typeof vehicles.find>>;
  ros: ReturnType<typeof Array.prototype.filter>;
  inspections: ReturnType<typeof Array.prototype.filter>;
}) {
  return (
    <div className="space-y-4">
      <Section title="Vehicle Specs">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Spec label="Year" value={String(vehicle.year)} />
          <Spec label="Make" value={vehicle.make} />
          <Spec label="Model" value={vehicle.model} />
          <Spec label="Plate" value={vehicle.licensePlate} />
          <Spec label="VIN" value={vehicle.vin} mono />
          <Spec
            label={vehicle.hours !== undefined ? "Hours" : "Mileage"}
            value={
              vehicle.hours !== undefined
                ? `${vehicle.hours.toLocaleString()} hrs`
                : `${(vehicle.mileage ?? 0).toLocaleString()} mi`
            }
          />
          <Spec
            label="Last Service"
            value={format(parseISO(vehicle.lastService), "MMM d, yyyy")}
          />
          <Spec
            label="Frankenstein"
            value={vehicle.isFrankenstein ? "Yes" : "No"}
          />
        </div>
      </Section>

      <Section title="Recent Repair Orders" count={ros.length}>
        {ros.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-muted-foreground">
            No repair orders yet
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {ros.map((r: any) => (
              <li key={r.id} className="py-2">
                <Link
                  to="/repair-orders/$id"
                  params={{ id: r.id }}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums">#{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {r.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold tabular-nums">
                      {usd.format(r.total)}
                    </div>
                    <DateCell date={r.openedAt} className="text-[10px] text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Inspections" count={inspections.length}>
        {inspections.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-muted-foreground">No inspections yet</p>
        ) : (
          <ul className="space-y-2">
            {inspections.map((i: any) => (
              <li key={i.id}>
                <Link
                  to="/inspections/$id"
                  params={{ id: i.id }}
                  className="flex items-center gap-2 rounded-md border border-border p-2 transition-colors hover:bg-surface/40"
                >
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate text-xs font-semibold">{i.id}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {i.completedAt ? format(parseISO(i.completedAt), "MMM d") : "In progress"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function ServiceHistoryTab({
  ros,
  onRowClick,
}: {
  ros: ReturnType<typeof Array.prototype.filter>;
  onRowClick: (id: string) => void;
}) {
  if (ros.length === 0) {
    return <EmptyState icon={History} title="No service history" />;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">RO #</th>
            <th className="px-3 py-2 text-left font-semibold">Description</th>
            <th className="px-3 py-2 text-left font-semibold">Status</th>
            <th className="px-3 py-2 text-right font-semibold">Opened</th>
            <th className="px-3 py-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {ros.map((r: any) => (
            <tr
              key={r.id}
              onClick={() => onRowClick(r.id)}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-surface/40"
            >
              <td className="px-3 py-2.5">
                <Link to="/repair-orders/$id" params={{ id: r.id }} className="text-xs font-semibold hover:underline">
                  #{r.id}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-xs">{r.description}</td>
              <td className="px-3 py-2.5">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-3 py-2.5 text-right text-[11px]">
                <DateCell date={r.openedAt} />
              </td>
              <td className="px-3 py-2.5 text-right">
                <MoneyCell value={r.total} className="text-xs font-semibold" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InspectionsListTab({ inspections }: { inspections: ReturnType<typeof Array.prototype.filter> }) {
  if (inspections.length === 0) return <EmptyState icon={ClipboardCheck} title="No inspections" />;
  return (
    <div className="space-y-2">
      {inspections.map((i: any) => (
        <Link
          key={i.id}
          to="/inspections/$id"
          params={{ id: i.id }}
          className="block rounded-md border border-border bg-background p-3 transition-colors hover:bg-surface/40"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold">{i.id}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {i.completedAt ? format(parseISO(i.completedAt), "MMM d, yyyy") : "In progress"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EstimatesListTab({ estimates }: { estimates: ReturnType<typeof Array.prototype.filter> }) {
  if (estimates.length === 0) return <EmptyState icon={FileText} title="No estimates" />;
  return (
    <div className="space-y-2">
      {estimates.map((e: any) => (
        <Link
          key={e.id}
          to="/estimates/$id"
          params={{ id: e.id }}
          className="block rounded-md border border-border bg-background p-3 transition-colors hover:bg-surface/40"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold">{e.id}</div>
              <div className="text-[10px] text-muted-foreground capitalize">
                {e.status.replace("-", " ")}
              </div>
            </div>
            <MoneyCell value={e.total} className="text-xs font-semibold" />
          </div>
        </Link>
      ))}
    </div>
  );
}

function PhotosTab({ vin }: { vin: string }) {
  const photos = ["Driver side", "Rear", "VIN plate", "Interior", "Engine bay", "Defect detail"];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = () => {
    toast.success("Photo uploaded");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCardClick = (label: string) => {
    if (label === "VIN plate") {
      toast.info("Re-scanning VIN…");
      setTimeout(() => {
        toast.success("VIN re-decoded: " + vin);
      }, 800);
      return;
    }
    toast.info("Photo preview", { description: label });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handleUploadClick}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium hover:bg-surface"
        >
          <Upload className="h-3 w-3" />
          Upload Photo
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleCardClick(p)}
            className="overflow-hidden rounded-lg border border-border bg-background text-left transition-colors hover:bg-surface/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            <div className="flex h-28 items-center justify-center bg-surface">
              <Camera className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="flex items-center justify-between p-2 text-[11px] font-medium">
              <span>{p}</span>
              {p === "VIN plate" && (
                <ScanLine className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function NotesTab({ note }: { note?: string }) {
  const [notes, setNotes] = useState(note ?? "");
  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Vehicle-specific notes (aftermarket equipment, recurring issues, customer preferences)…"
        className="h-32 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => toast.success("Notes saved")}
        className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90"
      >
        <Save className="h-3 w-3" />
        Save
      </button>
    </div>
  );
}

// ====================================================================
// Helpers
// ====================================================================
function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider">
          {title}
          {count != null && (
            <span className="ml-2 text-muted-foreground">({count})</span>
          )}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Spec({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={clsx("mt-0.5 text-sm font-medium", mono && "font-mono text-[11px]")}>
        {value}
      </div>
    </div>
  );
}
