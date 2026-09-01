import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { campaigns } from "@/lib/data";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

export function Campaigns() {
  return (
    <section id="vaquinhas" className="py-24">
      <Container>
        <SectionHeading
          title="Vaquinhas em Destaque"
          subtitle="Sua contribuição salva vidas. Ajude a financiar o tratamento de animais resgatados."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const percent = Math.round((campaign.raised / campaign.goal) * 100);
            return (
              <div
                key={campaign.id}
                className="bg-surface dark:bg-surface-dark rounded-2xl overflow-hidden border border-border dark:border-border-dark shadow-sm"
              >
                <div className="relative h-48">
                  <Image
                    src={campaign.imageUrl}
                    alt={campaign.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold mb-4 line-clamp-2">
                    {campaign.title}
                  </h4>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-primary">
                        {formatCurrency(campaign.raised)} arrecadados
                      </span>
                      <span className="text-muted dark:text-muted-dark">
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted dark:text-muted-dark mb-6">
                    <span>Meta: {formatCurrency(campaign.goal)}</span>
                    <span>{campaign.daysLeft} dias restantes</span>
                  </div>
                  <Button variant="secondary" className="w-full">
                    Contribuir agora
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
