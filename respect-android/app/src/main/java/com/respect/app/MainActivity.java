package com.respect.app;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.graphics.Typeface;
import android.content.SharedPreferences;
import android.view.Gravity;
import android.view.View;
import android.widget.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class MainActivity extends Activity {
    private static final String PREFS = "respect";
    private static final String[] HABITS = {"learning", "movement", "sport", "snooker", "sleep", "reflection"};
    private SharedPreferences prefs;
    private LinearLayout root, content;
    private TextView scoreText, streakText, weekText;
    private String today;

    int dp(float n) { return (int)(n * getResources().getDisplayMetrics().density + 0.5f); }
    TextView tv(String text, float sp, int color, boolean bold) {
        TextView v = new TextView(this); v.setText(text); v.setTextSize(sp); v.setTextColor(color); v.setIncludeFontPadding(false);
        v.setTypeface(Typeface.create("sans", bold ? Typeface.BOLD : Typeface.NORMAL)); v.setPadding(0,0,0,0); return v;
    }
    void addGap(int h){ Space s = new Space(this); s.setLayoutParams(new LinearLayout.LayoutParams(1, dp(h))); content.addView(s); }

    @Override public void onCreate(Bundle b) {
        super.onCreate(b); prefs = getSharedPreferences(PREFS, MODE_PRIVATE); today = dayKey(new Date()); buildShell(); showToday();
    }
    String dayKey(Date d){ return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(d); }
    String humanDate(Date d){ return new SimpleDateFormat("EEEE, d MMMM", Locale.US).format(d); }
    boolean get(String day, String h){ return prefs.getBoolean(day+"_"+h, false); }
    void set(String day, String h, boolean v){ prefs.edit().putBoolean(day+"_"+h, v).apply(); }
    int score(String day){ int s=0; if(get(day,"learning"))s+=30; if(get(day,"movement"))s+=20; if(get(day,"sport"))s+=15; if(get(day,"snooker"))s+=15; if(get(day,"sleep"))s+=10; if(get(day,"reflection"))s+=10; return s; }
    int streak(){ int n=0; Calendar c=Calendar.getInstance();
        while(true){ String d=dayKey(c.getTime()); if(score(d)>=70){n++; c.add(Calendar.DAY_OF_MONTH,-1);} else break; if(n>365)break; } return n; }

    void buildShell(){
        root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(Color.rgb(11,16,32));
        root.setPadding(dp(18), dp(16), dp(18), dp(8)); setContentView(root);
        LinearLayout header = new LinearLayout(this); header.setGravity(Gravity.CENTER_VERTICAL);
        TextView title=tv("Respect",28,Color.rgb(245,247,255),true); header.addView(title,new LinearLayout.LayoutParams(0,dp(40),1));
        streakText=tv("",14,Color.rgb(157,168,195),true); header.addView(streakText);
        root.addView(header);
        content = new LinearLayout(this); content.setOrientation(LinearLayout.VERTICAL); content.setPadding(0,dp(6),0,dp(74));
        ScrollView sv=new ScrollView(this); sv.setFillViewport(true); sv.addView(content); root.addView(sv,new LinearLayout.LayoutParams(-1,0,1));
        LinearLayout nav=new LinearLayout(this); nav.setGravity(Gravity.CENTER); nav.setPadding(0,dp(7),0,0); nav.setBackgroundColor(Color.rgb(11,16,32));
        Button t=navBtn("TODAY"); Button d=navBtn("DASHBOARD"); nav.addView(t,new LinearLayout.LayoutParams(0,dp(48),1)); nav.addView(d,new LinearLayout.LayoutParams(0,dp(48),1));
        t.setOnClickListener(v->showToday()); d.setOnClickListener(v->showDashboard()); root.addView(nav,new LinearLayout.LayoutParams(-1,dp(56)));
    }
    Button navBtn(String s){ Button b=new Button(this); b.setText(s); b.setTextSize(12); b.setTextColor(Color.rgb(245,247,255)); b.setBackgroundColor(Color.TRANSPARENT); return b; }
    Button button(String text, boolean primary){ Button b=new Button(this); b.setText(text); b.setTextSize(14); b.setAllCaps(false); b.setTypeface(Typeface.DEFAULT,Typeface.BOLD); b.setTextColor(primary?Color.rgb(11,16,32):Color.rgb(245,247,255)); b.setBackgroundResource(primary?com.respect.app.R.drawable.bg_button:com.respect.app.R.drawable.bg_secondary_button); return b; }

    TextView section(String h){ TextView x=tv(h,18,Color.rgb(245,247,255),true); x.setPadding(0,dp(4),0,dp(8)); content.addView(x); return x; }
    LinearLayout card(){ LinearLayout c=new LinearLayout(this); c.setOrientation(LinearLayout.VERTICAL); c.setBackgroundResource(R.drawable.bg_card); c.setPadding(dp(16),dp(14),dp(16),dp(14)); content.addView(c,new LinearLayout.LayoutParams(-1,-2)); return c; }

    void showToday(){ content.removeAllViews(); streakText.setText(""+streak()+" day streak");
        TextView date=tv(humanDate(new Date()),14,Color.rgb(157,168,195),false); content.addView(date); addGap(10);
        LinearLayout hero=card(); scoreText=tv(score(today)+"%",42,Color.rgb(142,167,255),true); hero.addView(scoreText); TextView label=tv("Today’s respect score",15,Color.rgb(245,247,255),true); label.setPadding(0,dp(4),0,dp(8)); hero.addView(label);
        TextView msg=tv(message(score(today)),14,Color.rgb(157,168,195),false); hero.addView(msg); addGap(12);
        section("Daily commitments");
        addHabit("learning","Learning — 45 min of focused practice",30);
        addHabit("movement","Movement — 20+ min",20);
        addHabit("sport","Sport — gym, pool, walk, or a real session",15);
        addHabit("snooker","Snooker — only within the plan",15);
        addHabit("sleep","Sleep — respected the target window",10);
        addHabit("reflection","Reflection — one honest sentence",10);
        addGap(10); Button review=button("Write today's reflection",false); review.setOnClickListener(v->reflectionDialog()); content.addView(review,new LinearLayout.LayoutParams(-1,dp(50)));
    }
    String message(int s){ if(s>=90)return "Excellent. You kept your word to yourself today."; if(s>=70)return "Solid day. Keep the chain alive."; if(s>=40)return "You're moving. Finish one more commitment."; if(s>0)return "No perfection needed. Do the next useful thing."; return "Start small. Respect begins with one action."; }
    void addHabit(String key,String label,int pts){ LinearLayout c=card(); LinearLayout row=new LinearLayout(this); row.setGravity(Gravity.CENTER_VERTICAL); CheckBox cb=new CheckBox(this); cb.setChecked(get(today,key)); cb.setButtonTintList(android.content.res.ColorStateList.valueOf(Color.rgb(142,167,255))); row.addView(cb,new LinearLayout.LayoutParams(dp(52),dp(52))); LinearLayout tx=new LinearLayout(this); tx.setOrientation(LinearLayout.VERTICAL); TextView a=tv(label,15,Color.rgb(245,247,255),true); TextView p=tv("+"+pts+" points",12,Color.rgb(157,168,195),false); tx.addView(a); tx.addView(p); row.addView(tx,new LinearLayout.LayoutParams(0,-2,1)); c.addView(row); cb.setOnCheckedChangeListener((v,is)->{set(today,key,is); refreshToday();}); }
    void refreshToday(){ int s=score(today); if(scoreText!=null)scoreText.setText(s+"%"); streakText.setText(streak()+" day streak"); }

    void reflectionDialog(){ final EditText input=new EditText(this); input.setHint("What did you do well? What will you improve tomorrow?"); input.setText(prefs.getString(today+"_note","")); input.setTextColor(Color.WHITE); input.setHintTextColor(Color.rgb(157,168,195)); input.setMinLines(3); input.setGravity(Gravity.TOP); LinearLayout box=new LinearLayout(this); box.setPadding(dp(16),dp(8),dp(16),0); box.addView(input,new LinearLayout.LayoutParams(-1,-2)); new android.app.AlertDialog.Builder(this).setTitle("One honest sentence").setView(box).setPositiveButton("Save",(d,w)->{prefs.edit().putString(today+"_note",input.getText().toString().trim()).apply(); set(today,"reflection",!input.getText().toString().trim().isEmpty()); refreshToday();}).setNegativeButton("Cancel",null).show(); }

    void showDashboard(){ content.removeAllViews(); streakText.setText(streak()+" day streak"); section("Your last 7 days");
        LinearLayout summary=card(); int total=0, wins=0; Calendar c=Calendar.getInstance(); for(int i=0;i<7;i++){String d=dayKey(c.getTime()); int s=score(d); total+=s; if(s>=70)wins++; c.add(Calendar.DAY_OF_MONTH,-1);} TextView avg=tv((total/7)+"%",34,Color.rgb(142,167,255),true); summary.addView(avg); summary.addView(tv("average score • "+wins+" strong days",14,Color.rgb(157,168,195),false)); addGap(12);
        c=Calendar.getInstance(); for(int i=0;i<7;i++){ String d=dayKey(c.getTime()); LinearLayout row=card(); LinearLayout line=new LinearLayout(this); line.setGravity(Gravity.CENTER_VERTICAL); TextView name=tv(new SimpleDateFormat("EEE, d MMM",Locale.US).format(c.getTime()),14,Color.rgb(245,247,255),true); line.addView(name,new LinearLayout.LayoutParams(0,dp(36),1)); TextView ss=tv(score(d)+"%",16,score(d)>=70?Color.rgb(88,214,162):Color.rgb(245,247,255),true); line.addView(ss); row.addView(line); c.add(Calendar.DAY_OF_MONTH,-1); }
        addGap(8); section("Weekly reset"); LinearLayout coach=card(); coach.addView(tv(weeklyMessage(total,wins),15,Color.rgb(245,247,255),false)); addGap(8); Button clear=button("Reset this week",false); clear.setOnClickListener(v->confirmReset()); content.addView(clear,new LinearLayout.LayoutParams(-1,dp(50)));
    }
    String weeklyMessage(int total,int wins){ int avg=total/7; if(wins>=6)return "This is becoming a real habit. Protect the routine, not the mood."; if(wins>=4)return "Good momentum. Make the next week easier by scheduling sport first."; if(avg>=50)return "You are showing up. The next step is consistency, not intensity."; return "Start with the smallest version of the plan and build from there."; }
    void confirmReset(){ new android.app.AlertDialog.Builder(this).setTitle("Reset weekly habit checks?").setMessage("This clears the last 7 days of check-ins. Your reflections stay private on your phone only.").setPositiveButton("Reset",(d,w)->{ Calendar c=Calendar.getInstance(); SharedPreferences.Editor e=prefs.edit(); for(int i=0;i<7;i++){String day=dayKey(c.getTime()); for(String h:HABITS)e.remove(day+"_"+h); e.remove(day+"_note"); c.add(Calendar.DAY_OF_MONTH,-1);} e.apply(); showDashboard(); }).setNegativeButton("Cancel",null).show(); }
}
