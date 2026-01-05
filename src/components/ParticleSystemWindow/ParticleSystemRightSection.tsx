import { Magnet, Zap } from "lucide-solid"
import { ParticleBehaviorCard, RangeControl } from "./ParticleSystemWindow"
import { createSignal } from "solid-js"
import { state } from "../../engine/store";

const ParticleSystemRightSection = () => {
  const [refresh, setRefresh] = createSignal(0);
  const update = () => setRefresh(r => r + 1);
  const ps = () => {
    refresh();
    return state.selectedParticleSystem;
  }

  const getGravityValue = (axis: number) => {
    const particle = ps();
    if (!particle) return 0;
    return particle.gravityForce[axis];
  }

  const getVelocityValue = (axis: number) => {
    const particle = ps();
    if (!particle) return 0;
    return particle.velocity[axis];
  }
  return (
    <div class="col-span-4  bg-zinc-800/30 p-4">
      <div class="pb-3 w-full border-b border-zinc-800 mb-4 flex justify-center items-center">
        <h1 class="font-black text-zinc-500/80 text-[10px] uppercase tracking-[0.2em]">Behaviors</h1>
      </div>
      <div class="flex flex-col space-y-4 mt-4">
        <ParticleBehaviorCard
          disclaimer="123"
          description="allows you to change how the particle behave under gravity"
          icon={Magnet}
          isActive={ps()?.useGravity || false}
          onToggle={() => {
            const particle = ps();
            if (!particle) return;
            particle.useGravity = !particle.useGravity
            update();
          }}
          title="Use Gravity"
          accent="orange"

        >
          <RangeControl
            label="Horizontal Wind (X)"
            value={getGravityValue(0)}
            onInput={(e: Event & { currentTarget: HTMLInputElement }) => {
              const particle = ps();
              if (!particle) return;
              particle.gravityForce[0] = parseFloat(e.currentTarget.value);
              update();
            }}
            min={-1} max={1}
            step={0.001}
            accentColor="orange"
          />
          <RangeControl
            label="Vertical Force (Y)"
            value={getGravityValue(1)}
            onInput={(e: Event & { currentTarget: HTMLInputElement }) => {
              const particle = ps();
              if (!particle) return;
              particle.gravityForce[1] = parseFloat(e.currentTarget.value);
              update();
            }}
            min={-20} max={20}
            accentColor="orange"
          />

          <RangeControl
            label="Depth Force (Z)"
            value={getGravityValue(2)}
            onInput={(e: Event & { currentTarget: HTMLInputElement }) => {
              const particle = ps();
              if (!particle) return;
              particle.gravityForce[2] = parseFloat(e.currentTarget.value);
              update();
            }}
            min={-10} max={10}
            accentColor="orange"
          />
        </ParticleBehaviorCard>
        <ParticleBehaviorCard
          disclaimer="Disclaimer: This can be confusing at first, basically if you change the velocity that means the particles will move along the axis you changed value of OVER TIME, so if you need something like a small laser beam, you just need to put the values really low, on the other case if you need something like a huge explosion, then you have to put the values high."
          description="responsible for changing how fast particles move"
          icon={Zap}
          isActive={ps()?.useVelocity || false}
          onToggle={() => {
            const particle = ps();
            if (!particle) return;
            particle.useVelocity = !particle.useVelocity;
            update();
          }}
          title="Use Velocity"
          accent="blue"
        >
          <RangeControl
            label="Velocity (X)"
            value={getVelocityValue(0)}
            onInput={(e: Event & { currentTarget: HTMLInputElement }) => {
              const particle = ps();
              if (!particle) return;
              particle.velocity[0] = parseFloat(e.currentTarget.value);
              update();
            }}
            min={-10} max={10}
            accentColor="blue"
          />
          <RangeControl
            label="Velocity (Y)"
            value={getVelocityValue(1)}
            onInput={(e: Event & { currentTarget: HTMLInputElement }) => {
              const particle = ps();
              if (!particle) return;
              particle.velocity[1] = parseFloat(e.currentTarget.value);
              update();
            }}
            min={-10} max={10}
            accentColor="blue"
          />
          <RangeControl
            label="Velocity (Z)"
            value={getVelocityValue(2)}
            onInput={(e: Event & { currentTarget: HTMLInputElement }) => {
              const particle = ps();
              if (!particle) return;
              particle.velocity[2] = parseFloat(e.currentTarget.value);
              update();
            }}
            min={-10} max={10}
            accentColor="blue"
          />
          <p class="">
            
          </p>
        </ParticleBehaviorCard>
      </div>
    </div>
  )
}

export default ParticleSystemRightSection