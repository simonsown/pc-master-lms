import { create } from 'zustand';
import {
  type CPUProduct,
  type GPUProduct,
  type MainboardProduct,
  type RAMProduct,
  type PSUProduct,
  type CaseProduct,
  type CoolerProduct,
  type SSDProduct,
  type AnyProduct,
  type CompatibilityIssue,
  type BuildScenario,
} from '@/types/pc-components';
import {
  checkCompatibility,
  calculateCompatibilityScore,
  calculateTotalTdp,
  calculateTotalPrice,
  estimatePerformance,
} from './compatibility-engine';

interface BuildState {
  cpu: CPUProduct | null;
  gpu: GPUProduct | null;
  mainboard: MainboardProduct | null;
  ram: RAMProduct[];
  psu: PSUProduct | null;
  case: CaseProduct | null;
  cooler: CoolerProduct | null;
  ssd: SSDProduct[];
  buildName: string;
  activeScenario: BuildScenario | null;
  budget: number;

  issues: CompatibilityIssue[];
  score: number;
  totalTdp: number;
  totalPrice: number;
  performance: { gaming: number; productivity: number; workstation: number; value: number };

  setCPU: (cpu: CPUProduct | null) => void;
  setGPU: (gpu: GPUProduct | null) => void;
  setMainboard: (mb: MainboardProduct | null) => void;
  addRAM: (ram: RAMProduct) => void;
  removeRAM: (index: number) => void;
  setPSU: (psu: PSUProduct | null) => void;
  setCase: (c: CaseProduct | null) => void;
  setCooler: (cooler: CoolerProduct | null) => void;
  addSSD: (ssd: SSDProduct) => void;
  removeSSD: (index: number) => void;
  clearAll: () => void;
  setBuildName: (name: string) => void;
  setActiveScenario: (s: BuildScenario | null) => void;
  setBudget: (b: number) => void;
  recalculate: () => void;
  loadBuild: (build: Partial<BuildState>) => void;
  saveToSupabase: () => Promise<string | null>;
  loadFromSupabase: (id: string) => Promise<void>;
}

export const useBuildStore = create<BuildState>((set, get) => ({
  cpu: null,
  gpu: null,
  mainboard: null,
  ram: [],
  psu: null,
  case: null,
  cooler: null,
  ssd: [],
  buildName: 'Build mới',
  activeScenario: null,
  budget: 15000000,

  issues: [],
  score: 0,
  totalTdp: 0,
  totalPrice: 0,
  performance: { gaming: 0, productivity: 0, workstation: 0, value: 0 },

  setCPU: (cpu) => { set({ cpu }); get().recalculate(); },
  setGPU: (gpu) => { set({ gpu }); get().recalculate(); },
  setMainboard: (mainboard) => { set({ mainboard }); get().recalculate(); },
  addRAM: (ram) => { set((s) => ({ ram: [...s.ram, ram] })); get().recalculate(); },
  removeRAM: (index) => { set((s) => ({ ram: s.ram.filter((_, i) => i !== index) })); get().recalculate(); },
  setPSU: (psu) => { set({ psu }); get().recalculate(); },
  setCase: (c) => { set({ case: c }); get().recalculate(); },
  setCooler: (cooler) => { set({ cooler }); get().recalculate(); },
  addSSD: (ssd) => { set((s) => ({ ssd: [...s.ssd, ssd] })); get().recalculate(); },
  removeSSD: (index) => { set((s) => ({ ssd: s.ssd.filter((_, i) => i !== index) })); get().recalculate(); },
  clearAll: () => set({
    cpu: null, gpu: null, mainboard: null, ram: [], psu: null,
    case: null, cooler: null, ssd: [], issues: [], score: 0,
    totalTdp: 0, totalPrice: 0, performance: { gaming: 0, productivity: 0, workstation: 0, value: 0 }
  }),
  setBuildName: (buildName) => set({ buildName }),
  setActiveScenario: (activeScenario) => set({ activeScenario }),
  setBudget: (budget) => set({ budget }),

  recalculate: () => {
    const state = get();
    const allComponents: AnyProduct[] = [
      state.cpu, state.gpu, state.mainboard, state.psu, state.case, state.cooler,
      ...state.ram, ...state.ssd
    ].filter(Boolean) as AnyProduct[];

    const issues = checkCompatibility({
      cpu: state.cpu, gpu: state.gpu, mainboard: state.mainboard,
      ram: state.ram, psu: state.psu, case: state.case,
      cooler: state.cooler, ssd: state.ssd,
    });

    const score = calculateCompatibilityScore(issues);
    const totalTdp = calculateTotalTdp({ cpu: state.cpu, gpu: state.gpu });
    const totalPrice = calculateTotalPrice(allComponents);
    const performance = estimatePerformance({ cpu: state.cpu, gpu: state.gpu, ram: state.ram });

    set({ issues, score, totalTdp, totalPrice, performance });
  },

  loadBuild: (build) => {
    set({
      cpu: build.cpu ?? null,
      gpu: build.gpu ?? null,
      mainboard: build.mainboard ?? null,
      ram: build.ram ?? [],
      psu: build.psu ?? null,
      case: build.case ?? null,
      cooler: build.cooler ?? null,
      ssd: build.ssd ?? [],
      buildName: build.buildName ?? 'Build mới',
    });
    get().recalculate();
  },

  saveToSupabase: async () => {
    const state = get();
    try {
      const { createClient } = await import('@/lib/supabase-client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const buildData = {
        user_id: user.id,
        name: state.buildName,
        cpu_id: state.cpu?.id || null,
        gpu_id: state.gpu?.id || null,
        mainboard_id: state.mainboard?.id || null,
        ram_ids: state.ram.map(r => r.id),
        psu_id: state.psu?.id || null,
        case_id: state.case?.id || null,
        cooler_id: state.cooler?.id || null,
        ssd_ids: state.ssd.map(s => s.id),
        compatibility_score: state.score,
        total_tdp: state.totalTdp,
        total_price: state.totalPrice,
      };

      const { data, error } = await supabase
        .from('saved_builds')
        .upsert(buildData)
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Failed to save build:', err);
      return null;
    }
  },

  loadFromSupabase: async (id: string) => {
    try {
      const { createClient } = await import('@/lib/supabase-client');
      const supabase = createClient();
      const { data, error } = await supabase
        .from('saved_builds')
        .select('*, cpu:products!cpu_id(*), gpu:products!gpu_id(*), mainboard:products!mainboard_id(*), ram:products!ram_ids(*), psu:products!psu_id(*), case:products!case_id(*), cooler:products!cooler_id(*), ssd:products!ssd_ids(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return;

      set({
        buildName: data.name,
        cpu: data.cpu as CPUProduct,
        gpu: data.gpu as GPUProduct,
        mainboard: data.mainboard as MainboardProduct,
        ram: (data.ram || []) as RAMProduct[],
        psu: data.psu as PSUProduct,
        case: data.case as CaseProduct,
        cooler: data.cooler as CoolerProduct,
        ssd: (data.ssd || []) as SSDProduct[],
      });
      get().recalculate();
    } catch (err) {
      console.error('Failed to load build:', err);
    }
  },
}));
