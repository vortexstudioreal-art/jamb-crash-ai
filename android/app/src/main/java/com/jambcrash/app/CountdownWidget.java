package com.jambcrash.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

public class CountdownWidget extends AppWidgetProvider {
    private static final String COUNTDOWN_PREFS = "CountdownPrefs";
    private static final String EXAM_DATE_KEY = "exam_date";
    private static final String ACTION_UPDATE = "com.jambcrash.app.UPDATE_COUNTDOWN";
    private static Handler handler = new Handler(Looper.getMainLooper());
    private static Runnable runnable;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        startPeriodicUpdate(context);
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        startPeriodicUpdate(context);
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        stopPeriodicUpdate();
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_countdown);
        
        // Get exam date (default to 30 days from now if not set)
        long examDateMillis = context.getSharedPreferences(COUNTDOWN_PREFS, Context.MODE_PRIVATE)
                .getLong(EXAM_DATE_KEY, System.currentTimeMillis() + TimeUnit.DAYS.toMillis(30));

        // Calculate countdown
        long currentTime = System.currentTimeMillis();
        long diff = examDateMillis - currentTime;
        
        String countdownText;
        if (diff > 0) {
            long days = TimeUnit.MILLISECONDS.toDays(diff);
            long hours = TimeUnit.MILLISECONDS.toHours(diff) - TimeUnit.DAYS.toHours(days);
            long minutes = TimeUnit.MILLISECONDS.toMinutes(diff) - TimeUnit.HOURS.toMinutes(TimeUnit.MILLISECONDS.toHours(diff));
            long seconds = TimeUnit.MILLISECONDS.toSeconds(diff) - TimeUnit.MINUTES.toSeconds(TimeUnit.MILLISECONDS.toMinutes(diff));
            
            countdownText = String.format(Locale.US, "%02d:%02d:%02d:%02d", days, hours, minutes, seconds);
        } else {
            countdownText = "EXAM DAY!";
        }
        
        views.setTextViewText(R.id.countdown_text, countdownText);

        // Launch app on click
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.countdown_text, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private void startPeriodicUpdate(Context context) {
        stopPeriodicUpdate();
        
        runnable = new Runnable() {
            @Override
            public void run() {
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
                int[] appWidgetIds = appWidgetManager.getAppWidgetIds(new ComponentName(context, CountdownWidget.class));
                
                for (int appWidgetId : appWidgetIds) {
                    updateAppWidget(context, appWidgetManager, appWidgetId);
                }
                
                handler.postDelayed(this, 1000);
            }
        };
        
        handler.post(runnable);
    }

    private void stopPeriodicUpdate() {
        if (runnable != null) {
            handler.removeCallbacks(runnable);
            runnable = null;
        }
    }
}
