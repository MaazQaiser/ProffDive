"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [role, setRole] = useState("Product Manager");
  const [stage, setStage] = useState("Fresh Graduate");
  
  return (
    <div className="p-8 lg:p-12 max-w-4xl space-y-12 bg-background text-foreground">
      <div className="space-y-4 border-b border-divider pb-8">
        <h1 className="text-3xl font-medium tracking-tight">Profile & Preferences</h1>
        <p className="text-sm text-muted">Manage your data, roles, and settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
        <div className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-muted border-b border-divider pb-2">Account</h2>
            <div className="space-y-4">
               <div>
                 <label className="text-xs text-muted">Name</label>
                 <div className="text-sm font-medium mt-1">Jane Doe</div>
               </div>
               <div>
                 <label className="text-xs text-muted">Email</label>
                 <div className="text-sm font-medium mt-1">jane@example.com <span className="text-[12px] ml-2 tracking-widest uppercase px-2 py-0.5 bg-divider text-muted rounded-full">Google Auth</span></div>
               </div>
            </div>
          </section>

          <section className="space-y-6 pt-6 border-t border-divider">
            <h2 className="text-xs uppercase tracking-widest text-muted border-b border-divider pb-2">Professional Setups</h2>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-widest text-muted">Target Role</span>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 border-b border-divider bg-transparent focus:outline-none focus:border-foreground transition-colors text-sm pb-1"
                />
              </label>
              
              <div className="space-y-2 mt-4">
                <span className="text-xs tracking-widest uppercase text-muted block mb-2">Career Stage</span>
                <select 
                  value={stage} 
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full bg-transparent border-b border-divider pb-2 text-sm focus:outline-none focus:border-foreground outline-none"
                >
                  <option className="bg-background text-foreground">Fresh Graduate</option>
                  <option className="bg-background text-foreground">Working Professional</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8 lg:border-l border-divider lg:pl-12">
          <section className="space-y-6">
             <h2 className="text-xs uppercase tracking-widest text-muted border-b border-divider pb-2">Consent Preferences</h2>
             <div className="space-y-4">
               <label className="flex items-center gap-4 group">
                  <div className="w-8 h-4 bg-status-ready flex items-center p-0.5" />
                  <span className="text-sm">Store interview transcripts</span>
               </label>
               <label className="flex items-center gap-4 group">
                  <div className="w-8 h-4 bg-status-ready flex items-center p-0.5" />
                  <span className="text-sm">Allow interview recording</span>
               </label>
               <label className="flex items-center gap-4 opacity-50">
                  <div className="w-8 h-4 border border-divider flex items-center p-0.5" />
                  <span className="text-sm text-muted">Body language feedback</span>
               </label>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
