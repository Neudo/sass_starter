"use client";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
import { ArrowRight, Play, TrendingUp, Users, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
        <div className="text-center">
          {/* Badge announcement avec les nouvelles couleurs */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="secondary"
              className="mb-8 px-4 py-2 bg-secondary/10 text-secondary border-secondary/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              Dana Analytics - Nouvelle génération
            </Badge>
          </motion.div> */}

          {/* Main headline avec gradient bleu-turquoise */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6"
          >
            Analytics
            <span className="bg-gradient-to-r from-primary via-ring to-secondary bg-clip-text text-transparent">
              {" "}
              Intelligents
            </span>
            <br />
            pour votre croissance
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Transformez vos données en décisions stratégiques avec Dana
            Analytics. Intelligence artificielle, respect de la vie privée,
            insights révolutionnaires.
          </motion.p>

          {/* CTA Buttons avec les nouvelles couleurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              Démarrer avec Dana
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors duration-200"
            >
              <Play className="mr-2 w-5 h-5" />
              Voir la démo live
            </Button>
          </motion.div>

          {/* Trust indicators avec les nouvelles couleurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <span>+15,000 entreprises conquises</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ring" />
              <span>+340% croissance moyenne</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-secondary" />
              <span>IA intégrée & RGPD</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Image/Dashboard Preview avec les nouvelles couleurs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 sm:mt-20"
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-card rounded-xl border border-border shadow-2xl overflow-hidden cursor-pointer hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
              <div className="aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted/20">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <div className="ml-4 text-sm text-muted-foreground">
                      Dana Analytics Dashboard
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-card p-4 rounded-lg border border-primary/10 shadow-sm">
                        <div className="text-2xl font-bold text-primary">
                          47,892
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Visiteurs IA-analysés
                        </div>
                        <div className="text-xs text-secondary flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +23% IA boost
                        </div>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-secondary/10 shadow-sm">
                        <div className="text-2xl font-bold text-secondary">
                          128,456
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Insights générés
                        </div>
                        <div className="text-xs text-ring flex items-center mt-1">
                          <Zap className="w-3 h-3 mr-1" />
                          Temps réel
                        </div>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-ring/10 shadow-sm">
                        <div className="text-2xl font-bold text-ring">8.7%</div>
                        <div className="text-sm text-muted-foreground">
                          Taux conversion
                        </div>
                        <div className="text-xs text-secondary flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Prédiction IA
                        </div>
                      </div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border h-32 shadow-sm">
                      <div className="text-sm text-muted-foreground mb-2">
                        Analytics IA - Tendances prédictives
                      </div>
                      <div className="h-20 bg-gradient-to-r from-primary/20 via-ring/30 to-secondary/20 rounded relative">
                        {/* Ligne de tendance simulée */}
                        <div className="absolute inset-0 flex items-end justify-around p-2">
                          {[40, 55, 48, 72, 65, 85, 78, 95].map((height, i) => (
                            <div
                              key={i}
                              className="bg-secondary rounded-sm w-2 transition-all duration-300 hover:bg-ring"
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Overlay pour indiquer que c'est cliquable */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-lg">
                  Découvrir Dana Analytics en action
                </div>
              </div>
            </div>

            {/* Éléments décoratifs avec les nouvelles couleurs */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary/10 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 -right-8 w-16 h-16 bg-ring/10 rounded-full blur-lg"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
