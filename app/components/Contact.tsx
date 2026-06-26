// components/contact.tsx
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/TextArea";
import { Mail, Phone, MapPin, Send } from "lucide-react";


export function Contact() {
  return (
    <section className="relative px-6 py-16 md:py-24 bg-gradient-to-b from-white via-green-50/30 to-green-50/50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-200/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 bg-green-100 rounded-full text-[#2c6e49] text-sm font-medium mb-4">
            Get in Touch
          </span>
          <h2 className="text-3xl font-bold text-[#2c6e49] sm:text-4xl lg:text-5xl">
            We'd Love to Hear From You
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Have questions or want to get involved? Reach out to us — we'd love to hear from you.
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover-lift">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <MapPin className="h-6 w-6 text-[#2c6e49]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2c6e49]">Address</h4>
                <p className="text-gray-600">123 Welfare Lane, Compassion City</p>
              </div>
            </div>
            
            <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover-lift">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <Phone className="h-6 w-6 text-[#2c6e49]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2c6e49]">Phone</h4>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover-lift">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <Mail className="h-6 w-6 text-[#2c6e49]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2c6e49]">Email</h4>
                <p className="text-gray-600">contact@tamimiwelfare.org</p>
              </div>
            </div>
          </div>
          
          <form className="space-y-4 rounded-3xl bg-white/80 backdrop-blur-sm p-6 md:p-8 shadow-xl border border-white/50">
            <Input 
              type="text" 
              placeholder="Your name" 
              className="border-green-200 bg-white/50 focus:bg-white transition-all duration-300" 
            />
            <Input 
              type="email" 
              placeholder="Your email" 
              className="border-green-200 bg-white/50 focus:bg-white transition-all duration-300" 
            />
            <Textarea 
              placeholder="Your message" 
              rows={4} 
              className="border-green-200 bg-white/50 focus:bg-white transition-all duration-300 resize-none" 
            />
            <Button className="group w-full bg-green-700 py-6 text-base font-semibold text-white hover:bg-green-800 transition-all duration-300 hover-lift">
              <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}