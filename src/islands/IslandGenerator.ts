import { CloudGenerator } from "./clouds/CloudGenerator.ts";
import { ValueNoise2D } from "./core/PeriodicNoise.ts";
import { SeededRandom } from "./core/SeededRandom.ts";
import { IslandModel } from "./IslandModel.ts";
import { IslandScale, PROP_TRIANGLE_CAP } from "./input/IslandScale.ts";
import { IslandSpec, type IslandInput } from "./input/IslandSpec.ts";
import { ThemeRamps } from "./input/IslandTheme.ts";
import { CliffMesher } from "./mesh/CliffMesher.ts";
import { FacetMeshBuilder, type FacetMeshOptions } from "./mesh/FacetMeshBuilder.ts";
import { FacetShader } from "./mesh/FacetShader.ts";
import { SurfaceTone, TerraceSurfaceMesher } from "./mesh/TerraceSurfaceMesher.ts";
import { UndersideMesher } from "./mesh/UndersideMesher.ts";
import { PropCatalog } from "./props/PropCatalog.ts";
import type { PropPlacement } from "./props/Prop.ts";
import { PropPlacer } from "./props/PropPlacer.ts";
import { AngleTable } from "./shape/ClosedOutline.ts";
import { IslandIdentity, OutlineFactory } from "./shape/OutlineFactory.ts";
import { TerraceStack } from "./shape/TerraceStack.ts";
import { UndersideProfile } from "./shape/UndersideProfile.ts";

export interface IslandShape {
  readonly scale: IslandScale;
  readonly identity: IslandIdentity;
  readonly stack: TerraceStack;
  readonly underside: UndersideProfile;
}

/** Runs the pipeline. Pure: the same input gives identical bytes, in Node or the browser. */
export class IslandGenerator {
  private readonly meshOptions: FacetMeshOptions;

  constructor(meshOptions: FacetMeshOptions = {}) {
    this.meshOptions = meshOptions;
  }

  shape(input: IslandInput): IslandShape {
    const spec = new IslandSpec(input);
    const outlineRng = new SeededRandom(spec.seed).fork("outline");
    const scale = new IslandScale(spec.size);
    const identity = new IslandIdentity(outlineRng.fork("identity"));
    const table = new AngleTable(scale.segments, outlineRng.fork("angles"));
    const base = OutlineFactory.base(identity, table, scale.radius);
    const stack = new TerraceStack(base, identity, scale, outlineRng.fork("terraces"));
    const underside = new UndersideProfile(stack, identity, outlineRng.fork("underside"));
    return { scale, identity, stack, underside };
  }

  generate(input: IslandInput): IslandModel {
    const spec = new IslandSpec(input);
    const root = new SeededRandom(spec.seed);
    const facetsRng = root.fork("facets");
    const propsRng = root.fork("props");
    const { scale, stack, underside } = this.shape(spec);
    const ramps = new ThemeRamps(spec.theme.palette);

    const builder = new FacetMeshBuilder(new FacetShader(facetsRng), this.meshOptions);
    const tone = new SurfaceTone(stack, new ValueNoise2D(facetsRng.fork("meadow"), 26), ramps.grass);
    const undersideMesher = new UndersideMesher(stack, underside, ramps);
    builder.layer("surface", () => new TerraceSurfaceMesher(stack, ramps.grass, tone, facetsRng.fork("summit")).emit(builder));
    builder.layer("cliff", () => new CliffMesher(stack, ramps, root.fork("outline").fork("cliffs")).emit(builder));
    builder.layer("underside", () => undersideMesher.emitShell(builder));
    builder.layer("tips", () => undersideMesher.emitTips(builder));

    const catalog = new PropCatalog(spec.theme, ramps);
    const allowance = Math.min(PROP_TRIANGLE_CAP, scale.triangleAllowance - builder.offered);
    const placements = new PropPlacer(stack, catalog, tone, propsRng, scale.propScale).place(scale.propTarget, allowance);
    builder.layer("props", () => this.emitProps(builder, catalog, placements, propsRng.fork("detail")));

    const puffs = new CloudGenerator(stack, underside, scale, root.fork("clouds")).generate();
    return new IslandModel({
      positions: builder.positionArray(),
      colors: builder.colorArray(),
      layers: {
        surface: builder.range("surface"),
        cliff: builder.range("cliff"),
        underside: builder.range("underside"),
        tips: builder.range("tips"),
        props: builder.range("props"),
      },
      offeredTriangles: builder.offered,
      placements,
      puffs,
    });
  }

  private emitProps(builder: FacetMeshBuilder, catalog: PropCatalog, placements: readonly PropPlacement[], rng: SeededRandom): void {
    for (const placement of placements) {
      builder.scaled(placement, placement.scale, () => catalog.prop(placement.kind).emit(builder, placement, rng));
    }
  }
}
