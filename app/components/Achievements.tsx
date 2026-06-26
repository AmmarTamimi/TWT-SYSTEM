import { Card, CardContent } from "./ui/Card";
import { TrendingUp, Users, Heart, Award } from "lucide-react";

const stats = [
  { 
    value: "12K+", 
    label: "Meals Served",
    icon: <Heart className="w-6 h-6 text-green-600" />,
    gradient: "from-green-50 to-green-100/50"
  },
  { 
    value: "850+", 
    label: "Families Supported",
    icon: <Users className="w-6 h-6 text-green-600" />,
    gradient: "from-green-50 to-emerald-100/50"
  },
  { 
    value: "45", 
    label: "Community Projects",
    icon: <Award className="w-6 h-6 text-green-600" />,
    gradient: "from-emerald-50 to-green-100/50"
  },
  { 
    value: "98%", 
    label: "Donor Satisfaction",
    icon: <TrendingUp className="w-6 h-6 text-green-600" />,
    gradient: "from-green-50 to-teal-100/50"
  },
];

export function Achievements() {
  return (
    <section className="relative px-6 py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/30 to-white"></div>
      
      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
            Our Impact
          </span>
          <h2 className="text-3xl font-bold text-[#2c6e49] sm:text-4xl lg:text-5xl">
            Making a Difference
            <span className="block text-green-600 text-2xl sm:text-3xl lg:text-4xl mt-2">
              in Numbers
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Together with our supporters, we have made a tangible difference in the community.
          </p>
        </div>
        
        <div className="mt-12 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.label} 
              className={`border-0 bg-gradient-to-br ${stat.gradient} shadow-lg hover-lift cursor-default transition-all duration-300`}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-white/60 rounded-full backdrop-blur-sm">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-[#2c6e49] sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}